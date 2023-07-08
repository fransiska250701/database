const express = require('express');
const bodyParser = require('body-parser');
const koneksi = require('./config/database');
const app = express();
const PORT = process.env.PORT || 5000;

const multer = require('multer')
const path = require('path')
const cors = require('cors')

// set body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors({
    origin: '*'
}));
// script upload

app.use(express.static("./public"))
 //! Use of Multer
var storage = multer.diskStorage({
    destination: (req, file, callBack) => {
        callBack(null, './public/images/')     // './public/images/' directory name where save the file
    },
    filename: (req, file, callBack) => {
        callBack(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
})
 
var upload = multer({
    storage: storage
}); // script untuk penggunaan multer saat upload
 
//=================== 17 maret 2023 == Penjelasan teori
 
 

// create data / insert data
app.post('/api/kosmetik',upload.single('foto'),(req, res) => {
    const data = { ...req.body };
    const kode = Math.floor(Math.random() * 9999);
    const nama = req.body.nama;
    const jumlah = req.body.jumlah;
    const deskripsi = req.body.deskripsi;
    const namaBarang = req.body.namaBarang;

    const querySql = 'INSERT INTO pesanan (kode,nama,jumlah,deskripsi,namaBarang) values (?,?,?,?,?);';
         
    // jalankan query
    koneksi.query(querySql,[kode,nama,jumlah,deskripsi,namaBarang], (err, rows, field) => {
        // error handling
        if (err) {
            return res.status(500).json({ message: 'Gagal insert data!', error: err });
        }
       
        // jika request berhasil
        res.status(201).json({ success: true, message: 'Berhasil insert data!' });
    });
});




// read data / get data
app.get('/api/kosmetik', (req, res) => {
    // buat query sql
    const querySql = 'SELECT * FROM pesanan';

    // jalankan query
    koneksi.query(querySql, (err, rows, field) => {
        // error handling
        if (err) {
            return res.status(500).json({ message: 'Ada kesalahan', error: err });
        }

        // jika request berhasil
        res.status(200).json({ success: true, data: rows });
    });
});


// update data
app.put('/api/kosmetik/:kode', (req, res) => {
    // buat variabel penampung data dan query sql
    const data = { ...req.body };
    const querySearch = 'SELECT * FROM pesanan WHERE kode = ?';
    const kode = req.body.kode;
    const nama = req.body.nama;
    const jumlah = req.body.jumlah;
    const deskripsi = req.body.deskripsi;
    const namaBarang = req.body.namaBarang;

    const queryUpdate = 'UPDATE pesanan SET nama=?,jumlah=?,deskripsi=?,namaBarang=? WHERE kode = ?';

    // jalankan query untuk melakukan pencarian data
    koneksi.query(querySearch, req.params.kode, (err, rows, field) => {
        // error handling
        if (err) {
            return res.status(500).json({ message: 'Ada kesalahan', error: err });
        }

        // jika id yang dimasukkan sesuai dengan data yang ada di db
        if (rows.length) {
            // jalankan query update
            koneksi.query(queryUpdate, [nama,jumlah,deskripsi,namaBarang, req.params.kode], (err, rows, field) => {
                // error handling
                if (err) {
                    return res.status(500).json({ message: 'Ada kesalahan', error: err });
                }

                // jika update berhasil
                res.status(200).json({ success: true, message: 'Berhasil update data!' });
            });
        } else {
            return res.status(404).json({ message: 'Data tidak ditemukan!', success: false });
        }
    });
});

// delete data
app.delete('/api/kosmetik/:kode', (req, res) => {
    // buat query sql untuk mencari data dan hapus
    const querySearch = 'SELECT * FROM pesanan WHERE kode = ?';
    const queryDelete = 'DELETE FROM pesanan WHERE kode = ?';

    // jalankan query untuk melakukan pencarian data
    koneksi.query(querySearch, req.params.kode, (err, rows, field) => {
        // error handling
        if (err) {
            return res.status(500).json({ message: 'Ada kesalahan', error: err });
        }

        // jika id yang dimasukkan sesuai dengan data yang ada di db
        if (rows.length) {
            // jalankan query delete
            koneksi.query(queryDelete, req.params.kode, (err, rows, field) => {
                // error handling
                if (err) {
                    return res.status(500).json({ message: 'Ada kesalahan', error: err });
                }

                // jika delete berhasil
                res.status(200).json({ success: true, message: 'Berhasil hapus data!' });
            });
        } else {
            return res.status(404).json({ message: 'Data tidak ditemukan!', success: false });
        }
    });
});

// buat server nya
app.listen(PORT, () => console.log(`Server running at port: ${PORT}`));
