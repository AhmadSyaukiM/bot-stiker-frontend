# 🤖 Y.BOT --- WhatsApp Sticker Converter

Y.BOT adalah aplikasi web untuk mengubah gambar yang dikirim melalui
WhatsApp menjadi stiker WhatsApp berformat **WebP** secara otomatis.
Proyek ini menggunakan **Next.js** untuk antarmuka web dan **Node.js,
Express, Socket.IO, serta Baileys** untuk menghubungkan WhatsApp dan
memproses pesan.

> **Catatan:** Baileys merupakan library pihak ketiga yang berinteraksi
> dengan WhatsApp Web dan bukan API resmi WhatsApp Business Platform.
> Penggunaan dapat memiliki risiko perubahan kompatibilitas atau
> pembatasan dari WhatsApp. Gunakan dengan akun dan risiko Anda sendiri.

------------------------------------------------------------------------

## 📌 Fitur Utama

-   **Pairing perangkat WhatsApp**\
    Hubungkan akun WhatsApp dengan memindai QR Code melalui menu *Linked
    Devices*.

-   **Konversi gambar menjadi stiker**\
    Gambar yang diterima bot diproses menjadi stiker berformat WebP.

-   **Pemrosesan gambar dengan Sharp**\
    Gambar disesuaikan agar sesuai dengan kanvas stiker hingga ukuran
    512 × 512 piksel. Hasil akhir bergantung pada implementasi proses
    konversi di backend.

-   **Status koneksi secara real-time**\
    Socket.IO mengirimkan pembaruan status koneksi dan QR Code dari
    backend ke frontend.

-   **Antarmuka Neo-Brutalism**\
    Tampilan modern, kontras, responsif, dan mudah digunakan.

------------------------------------------------------------------------

## 🧰 Teknologi yang Digunakan

  Bagian                 Teknologi
  ---------------------- ------------------------------
  Frontend               Next.js, React, Tailwind CSS
  Backend                Node.js, Express
  Koneksi WhatsApp       Baileys
  Komunikasi real-time   Socket.IO
  Pemrosesan gambar      Sharp
  Deployment frontend    Vercel
  Deployment backend     Railway

------------------------------------------------------------------------

## ✅ Prasyarat

Pastikan perangkat Anda sudah memiliki:

1.  **Node.js** --- gunakan versi yang didukung oleh dependensi proyek;
    Node.js 18 atau lebih baru dapat menjadi titik awal, tetapi periksa
    persyaratan paket yang digunakan.
2.  **npm** --- biasanya sudah terpasang bersama Node.js.
3.  **Git** --- untuk mengambil repositori proyek.
4.  **Akun GitHub** --- untuk menyimpan kode sumber.
5.  **Akun deployment** --- Railway untuk backend dan Vercel untuk
    frontend jika ingin menjalankannya secara online.
6.  **Aplikasi WhatsApp di smartphone** --- untuk menautkan perangkat
    bot.

------------------------------------------------------------------------

## 📁 Struktur Proyek

Proyek ini dipisahkan menjadi dua aplikasi:

``` text
bot-stiker/
├── bot-stiker-backend/    # Express, Socket.IO, Baileys, dan Sharp
└── bot-stiker-frontend/   # Next.js dan Tailwind CSS
```

Struktur folder di atas merupakan gambaran umum. Sesuaikan nama folder
dengan struktur repositori Anda.

------------------------------------------------------------------------

## 🚀 Instalasi dan Menjalankan Secara Lokal

### 1. Clone repositori

Ganti URL berikut dengan URL repositori GitHub yang benar:

``` bash
git clone https://github.com/USERNAME/bot-stiker.git
cd bot-stiker
```

### 2. Jalankan backend

Buka terminal pertama:

``` bash
cd bot-stiker-backend
npm install
npm run dev
```

Jika skrip `dev` tersedia di `package.json`, backend akan berjalan
sesuai konfigurasi proyek. Contoh alamat lokalnya adalah:

``` text
http://localhost:5000
```

Pastikan port tersebut sesuai dengan konfigurasi server backend Anda.

### 3. Konfigurasikan frontend

Buka terminal kedua dari direktori utama proyek:

``` bash
cd bot-stiker-frontend
npm install
```

Buat file **`.env.local`** di folder `bot-stiker-frontend`, lalu isi
dengan:

``` env
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
```

Variabel tersebut digunakan frontend untuk menemukan alamat backend.
Pastikan kode frontend memang membaca nama variabel ini.

### 4. Jalankan frontend

Masih di folder `bot-stiker-frontend`, jalankan:

``` bash
npm run dev
```

Buka alamat pengembangan Next.js yang ditampilkan di terminal. Umumnya:

``` text
http://localhost:3000
```

### 5. Periksa koneksi

Pastikan backend dan frontend sama-sama berjalan. Jika status tidak
muncul atau QR Code tidak tampil, periksa URL backend, konfigurasi CORS,
koneksi Socket.IO, serta log pada kedua terminal.

------------------------------------------------------------------------

## ☁️ Deployment ke Internet

Untuk deployment, frontend dan backend dijalankan sebagai dua layanan
terpisah: frontend di Vercel dan backend di Railway.

### Langkah 1 --- Deploy backend ke Railway

1.  Push kode backend ke repositori GitHub.

2.  Buka [Railway](https://railway.app/) dan buat proyek baru dari
    repositori backend.

3.  Pastikan Railway menggunakan folder backend yang benar sebagai root
    directory jika repositori Anda berisi lebih dari satu aplikasi.

4.  Atur build dan start command sesuai `package.json` backend.
    Contohnya dapat berupa `npm start` jika skrip tersebut tersedia.

5.  Pastikan server mendengarkan port yang disediakan melalui
    environment variable `PORT`, jika didukung konfigurasi aplikasi.

6.  Di pengaturan jaringan Railway, buat domain publik.

7.  Salin URL backend yang dihasilkan, misalnya:

    ``` text
    https://nama-backend.up.railway.app
    ```

    URL di atas hanya contoh. Gunakan domain yang benar-benar diberikan
    kepada layanan Anda.

### Langkah 2 --- Deploy frontend ke Vercel

1.  Push kode frontend ke GitHub.

2.  Buka [Vercel](https://vercel.com/) dan impor repositori frontend.

3.  Jika frontend dan backend berada dalam satu repositori, atur **Root
    Directory** ke `bot-stiker-frontend`.

4.  Tambahkan environment variable berikut pada pengaturan proyek:

      Key                         Value
      --------------------------- ---------------------------------
      `NEXT_PUBLIC_BACKEND_URL`   URL publik backend Railway Anda

    Contoh value:

    ``` env
    NEXT_PUBLIC_BACKEND_URL=https://nama-backend.up.railway.app
    ```

5.  Jalankan deployment.

6.  Setelah deployment selesai, buka domain frontend yang diberikan
    Vercel.

### Langkah 3 --- Pastikan koneksi frontend dan backend

Periksa hal-hal berikut jika aplikasi tidak terhubung:

-   `NEXT_PUBLIC_BACKEND_URL` mengarah ke URL backend yang benar.
-   Backend mengizinkan origin frontend Vercel melalui konfigurasi CORS.
-   Koneksi Socket.IO dikonfigurasikan untuk menggunakan backend publik.
-   Endpoint dan protokol koneksi sudah sesuai dengan implementasi
    backend.
-   Setelah mengubah environment variable di Vercel, lakukan redeploy
    jika diperlukan.

### ⚠️ Catatan penting tentang sesi WhatsApp

Sesi autentikasi Baileys harus disimpan secara persisten agar tidak
perlu memindai QR Code setiap kali backend dimulai ulang. Penyimpanan
lokal pada layanan hosting dapat hilang saat layanan dibuat ulang atau
dipindahkan, bergantung pada konfigurasi hosting.

Sebelum digunakan secara rutin, konfigurasi penyimpanan persisten yang
sesuai dengan Railway atau solusi penyimpanan lain yang aman. Jangan
menyimpan kredensial sesi di repositori GitHub.

------------------------------------------------------------------------

## 📱 Cara Menggunakan Y.BOT

1.  Buka website Y.BOT.
2.  Pilih menu **LINK DEVICE**.
3.  Tunggu sampai QR Code muncul.
4.  Buka WhatsApp di smartphone.
5.  Masuk ke **Setelan / Settings → Perangkat tertaut / Linked
    Devices**.
6.  Pilih **Tautkan perangkat / Link a Device**, lalu pindai QR Code
    pada website.
7.  Tunggu sampai website menunjukkan status **ONLINE**.
8.  Dari akun WhatsApp lain, kirim gambar ke nomor WhatsApp yang
    terhubung dengan bot.
9.  Jika pemrosesan berhasil dan fitur tersebut sudah dikonfigurasikan
    di backend, bot akan membalas dengan stiker WhatsApp.

> Nama menu WhatsApp dapat sedikit berbeda bergantung pada sistem
> operasi dan versi aplikasi.

------------------------------------------------------------------------

## 🔒 Keamanan dan Privasi

-   **Lindungi data sesi.** File autentikasi Baileys memungkinkan akses
    ke sesi WhatsApp yang tertaut. Jangan membagikannya, mengunggahnya
    ke repositori publik, atau memasukkannya ke dalam log.
-   **Gunakan environment variable.** Simpan konfigurasi dan rahasia di
    environment variable layanan, bukan langsung di kode sumber.
-   **Batasi akses QR Code.** QR Code pairing dapat digunakan untuk
    menautkan perangkat. Jangan tampilkan QR Code kepada pengguna yang
    tidak berwenang.
-   **Atur CORS dengan benar.** Batasi origin yang diperbolehkan sesuai
    domain frontend Anda.
-   **Perhatikan isi pesan.** Pesan dan gambar perlu diproses oleh
    backend agar dapat dikonversi. Jangan menganggap seluruh pemrosesan
    di server sebagai komunikasi end-to-end terenkripsi.
-   **Gunakan akun dengan pertimbangan risiko.** Baileys bukan API resmi
    WhatsApp Business Platform. Perubahan pada WhatsApp Web dapat
    memengaruhi kestabilan aplikasi atau menyebabkan pembatasan akun.

------------------------------------------------------------------------

## 🧯 Pemecahan Masalah

  -----------------------------------------------------------------------
  Masalah                             Hal yang perlu diperiksa
  ----------------------------------- -----------------------------------
  QR Code tidak muncul                Status backend, log server, koneksi
                                      Socket.IO, dan proses pembuatan QR
                                      Code.

  Status tetap offline                Koneksi Baileys, sesi autentikasi,
                                      dan log backend.

  Frontend tidak terhubung            `NEXT_PUBLIC_BACKEND_URL`, CORS,
                                      URL Socket.IO, dan konfigurasi
                                      deployment.

  Bot tidak membalas gambar           Handler pesan, jenis media yang
                                      didukung, log proses unduh gambar,
                                      dan proses konversi Sharp.

  QR Code muncul lagi setelah restart Periksa apakah sesi disimpan secara
                                      persisten dan berhasil dimuat
                                      kembali.

  Deployment gagal                    Periksa root directory, versi
                                      Node.js, skrip `build`/`start`,
                                      port server, dan log deployment.
  -----------------------------------------------------------------------

Nama skrip, endpoint, serta detail konfigurasi dapat berbeda sesuai kode
sumber proyek. Gunakan `package.json` dan konfigurasi backend sebagai
acuan utama.

------------------------------------------------------------------------

## 📄 Lisensi

Proyek ini dapat dirilis di bawah lisensi **MIT** jika repositori
menyertakan file `LICENSE` dengan teks lisensi MIT yang sesuai. Pastikan
lisensi proyek dan dependensinya sudah diperiksa sebelum digunakan atau
didistribusikan untuk keperluan komersial.

------------------------------------------------------------------------

## 👨‍💻 Kontribusi

Kontribusi dan pengembangan lanjutan sangat dipersilakan.

1.  Fork repositori.
2.  Buat branch baru untuk perubahan Anda.
3.  Lakukan perubahan dan uji fitur terkait.
4.  Kirim pull request dengan penjelasan yang jelas.

------------------------------------------------------------------------

**Y.BOT --- Ubah gambar WhatsApp menjadi stiker dengan lebih praktis.**
