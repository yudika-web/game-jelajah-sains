#!/usr/bin/env python3
"""Create a short-path ready-to-play ZIP. Python is only required by the packager."""
from pathlib import Path, PurePosixPath
import argparse, hashlib, json, subprocess, zipfile

ROOT = Path(__file__).resolve().parent.parent
PREFIX = 'JS/'
MAX_MEMBER = 64

def package(output):
    files = {}
    for name in ['JALANKAN_JELAJAH_SAINS.bat', 'DIAGNOSTIK_JELAJAH_SAINS.bat']:
        data = (ROOT / name).read_bytes()
        assert data.count(b'\r\n') == data.count(b'\n') > 0, name
        files[name] = data
    for name in ['common.mjs', 'launch.mjs', 'static-server.mjs']:
        files['scripts/local/' + name] = (ROOT / 'scripts/local' / name).read_bytes()
    files['scripts/local/diagnose.mjs'] = (ROOT / 'scripts/local/diagnose-runtime.mjs').read_bytes()
    for name in ['index.html', 'character.html']:
        if not (ROOT / 'dist' / name).is_file():
            raise RuntimeError('Run npm run prepare:local before packaging; dist is incomplete.')
    for file in sorted((ROOT / 'dist').rglob('*')):
        if file.is_file():
            if file.is_symlink():
                raise RuntimeError('Symlink not allowed: ' + str(file))
            files['dist/' + file.relative_to(ROOT / 'dist').as_posix()] = file.read_bytes()
    files['package.json'] = b'{"name":"jelajah-sains-ready","private":true,"type":"module","engines":{"node":">=22.12.0"}}\n'
    files['BACA_DULU.txt'] = (
        'JELAJAH SAINS - PAKET SIAP MAIN\r\n\r\n'
        '1. Ekstrak seluruh ZIP ke folder pendek, misalnya C:\\Game.\r\n'
        '   Buka folder JS yang dihasilkan. Jangan menjalankan dari dalam ZIP.\r\n'
        '2. Jika Node.js belum ada, pasang Node.js 24 LTS dari https://nodejs.org/\r\n'
        '3. Klik ganda JALANKAN_JELAJAH_SAINS.bat.\r\n'
        '   Build sudah disertakan: tidak perlu npm ci, build atau persiapan.\r\n'
        '4. Biarkan jendela server terbuka selama bermain. Ctrl+C menghentikannya.\r\n'
        '   Jika bermasalah, buka DIAGNOSTIK_JELAJAH_SAINS.bat.\r\n\r\n'
        'Alamat laptop tetap http://localhost:5173 . Jangan membuka index.html langsung.\r\n'
        'Jika server lama masih aktif dari folder lain, tutup jendela server lama sendiri.\r\n'
        'Jangan hapus data browser. Progres mengikuti alamat, bukan lokasi folder game.\r\n'
        'Jika sebelumnya memakai 127.0.0.1, port lain atau IP LAN: ekspor progres dari\r\n'
        'alamat lama lalu impor pada alamat baru sebelum melanjutkan.\r\n\r\n'
        'Ini bukan EXE mandiri: Node.js tetap diperlukan. Python tidak diperlukan pemain.\r\n'
        'Untuk pembaruan, unduh paket siap main terbaru dan ekstrak ke folder pendek.\r\n'
        'Kode sumber dan laporan: https://github.com/yudika-web/game-jelajah-sains\r\n'
    ).encode('utf-8')
    commit = subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=ROOT, text=True).strip()
    manifest = {'gameSourceCommit': commit, 'prefix': PREFIX, 'node': '>=22.12.0',
                'backupFormat': 17, 'files': {n: hashlib.sha256(b).hexdigest() for n,b in sorted(files.items())}}
    files['PAKET.json'] = (json.dumps(manifest, indent=2) + '\n').encode()
    for name in files:
        member = PREFIX + name
        if len(member) > MAX_MEMBER or not member.isascii() or '..' in PurePosixPath(member).parts:
            raise RuntimeError('Unsafe/long archive member: ' + member)
    output.parent.mkdir(parents=True, exist_ok=True)
    # Standard DEFLATE, deterministic timestamps, no symlinks or platform-specific extra fields.
    with zipfile.ZipFile(output, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
        for name, data in sorted(files.items()):
            entry = zipfile.ZipInfo(PREFIX + name, date_time=(2026, 1, 1, 0, 0, 0))
            entry.compress_type = zipfile.ZIP_DEFLATED
            entry.create_system = 0
            archive.writestr(entry, data)
    with zipfile.ZipFile(output) as archive:
        assert archive.testzip() is None
        longest = max(archive.namelist(), key=len)
    print(json.dumps({'output': str(output), 'bytes': output.stat().st_size, 'members': len(files),
                      'longestMember': longest, 'maxMemberLength': len(longest), 'CRC': 'passed',
                      'gameSourceCommit': commit}, indent=2))

if __name__ == '__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--output',type=Path,default=ROOT/'unduhan/JS-Windows.zip')
    package(parser.parse_args().output)
