// Single source of truth for the /learn/build-a-covenant wizard contracts.
// The page imports buildContract() at build time to embed all 8 combos;
// CI runs this file directly to write .sil + args files and compile each
// with silverc — so the code shown on the page is exactly the code proven.
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export function buildContract({ backup, timelock, fixedDest }) {
  const params = ['pubkey owner'];
  if (backup) params.push('pubkey backupKey', 'temporal backupAfter');
  if (timelock) params.push('temporal unlockAt');
  if (fixedDest) params.push('pubkey destination');

  const guard = [
    '        byte[36] destScript = new ScriptPubKeyP2PK(destination);',
    '        require(tx.outputs[0].scriptPubKey == byte[](destScript));',
  ];
  const lines = [
    'pragma silverscript ^0.1.0;',
    '',
    `contract MyCovenant(${params.join(', ')}) {`,
    '    entry spend(sig s) {',
    '        require(checkSig(s, owner));',
  ];
  if (timelock) lines.push('        require(tx.time >= unlockAt);');
  if (fixedDest) lines.push(...guard);
  lines.push('    }');
  if (backup) {
    lines.push('', '    entry recover(sig s) {', '        require(checkSig(s, backupKey));', '        require(tx.time >= backupAfter);');
    if (fixedDest) lines.push(...guard);
    lines.push('    }');
  }
  lines.push('}');
  return lines.join('\n') + '\n';
}

export function comboKey({ backup, timelock, fixedDest }) {
  return `${backup ? 'backup' : 'solo'}_${timelock ? 'locked' : 'anytime'}_${fixedDest ? 'fixed' : 'free'}`;
}

export function allCombos() {
  const out = [];
  for (const backup of [false, true])
    for (const timelock of [false, true])
      for (const fixedDest of [false, true]) out.push({ backup, timelock, fixedDest });
  return out;
}

export function constructorArgs({ backup, timelock, fixedDest }) {
  // Placeholder values in declaration order; pubkeys are 32-byte arrays,
  // temporal is ABI-encoded as int (milliseconds, above LOCK_TIME_THRESHOLD).
  const args = [{ kind: 'bytes', value: Array(32).fill(0) }];
  if (backup) args.push({ kind: 'bytes', value: Array(32).fill(1) }, { kind: 'int', value: 1800000000000 });
  if (timelock) args.push({ kind: 'int', value: 1800000000000 });
  if (fixedDest) args.push({ kind: 'bytes', value: Array(32).fill(2) });
  return args;
}

// CLI: node scripts/gen-wizard-contracts.mjs <outdir> — writes all 8 combos.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const out = process.argv[2] ?? 'wizard-contracts';
  mkdirSync(out, { recursive: true });
  for (const c of allCombos()) {
    const key = comboKey(c);
    writeFileSync(`${out}/${key}.sil`, buildContract(c));
    writeFileSync(`${out}/${key}.args.json`, JSON.stringify(constructorArgs(c)));
    console.log(key);
  }
}
