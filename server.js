const express=require("express");
const session=require("express-session");
const multer=require("multer");
const path=require("path");
const fs=require("fs");
const Database=require("better-sqlite3");
require("dotenv").config();

const app=express();
const PORT=process.env.PORT||3000;
const ADMIN_USER=process.env.ADMIN_USER||"admin";
const ADMIN_PASSWORD=process.env.ADMIN_PASSWORD||"change-this-password";
const uploadDir=path.join(__dirname,"uploads");
fs.mkdirSync(uploadDir,{recursive:true});

const db=new Database("speen-zar.db");
db.exec(`CREATE TABLE IF NOT EXISTS products(
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 name TEXT NOT NULL, price INTEGER NOT NULL, category TEXT NOT NULL,
 collection TEXT NOT NULL, description TEXT DEFAULT '', image TEXT DEFAULT '',
 created_at TEXT DEFAULT CURRENT_TIMESTAMP
)`);

const storage=multer.diskStorage({
 destination:(req,file,cb)=>cb(null,uploadDir),
 filename:(req,file,cb)=>cb(null,Date.now()+"-"+Math.random().toString(36).slice(2)+path.extname(file.originalname).toLowerCase())
});
const upload=multer({storage,limits:{fileSize:5*1024*1024},fileFilter:(req,file,cb)=>{
 const ok=["image/jpeg","image/png","image/webp"].includes(file.mimetype);
 cb(ok?null:new Error("Only JPG, PNG or WEBP images are allowed"),ok);
}});

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(session({secret:process.env.SESSION_SECRET||"replace-me",resave:false,saveUninitialized:false,cookie:{httpOnly:true,sameSite:"lax"}}));
app.use(express.static(path.join(__dirname,"public")));
app.use("/uploads",express.static(uploadDir));

const auth=(req,res,next)=>req.session.admin?next():res.status(401).json({error:"Login required"});

app.post("/api/login",(req,res)=>{
 if(req.body.username===ADMIN_USER && req.body.password===ADMIN_PASSWORD){
   req.session.admin=true; return res.json({ok:true});
 }
 res.status(401).json({error:"Invalid username or password"});
});
app.post("/api/logout",(req,res)=>req.session.destroy(()=>res.json({ok:true})));
app.get("/api/me",(req,res)=>res.json({loggedIn:!!req.session.admin}));

app.get("/api/products",(req,res)=>{
 const rows=db.prepare("SELECT * FROM products ORDER BY id DESC").all();
 res.json(rows);
});
app.post("/api/products",auth,upload.single("photo"),(req,res)=>{
 const {name,price,category,collection,description=""}=req.body;
 if(!name || !price || !category || !collection) return res.status(400).json({error:"Name, price, category and collection are required"});
 const image=req.file?"/uploads/"+req.file.filename:"";
 const info=db.prepare("INSERT INTO products(name,price,category,collection,description,image) VALUES(?,?,?,?,?,?,?)")
   .run(name,Number(price),category,collection,description,image);
 res.json({ok:true,id:info.lastInsertRowid});
});
app.delete("/api/products/:id",auth,(req,res)=>{
 const row=db.prepare("SELECT image FROM products WHERE id=?").get(req.params.id);
 if(row?.image){const f=path.join(__dirname,row.image.replace("/uploads/","uploads/")); if(fs.existsSync(f)) fs.unlinkSync(f);}
 db.prepare("DELETE FROM products WHERE id=?").run(req.params.id);
 res.json({ok:true});
});

app.get("*",(req,res)=>res.sendFile(path.join(__dirname,"public","index.html")));
app.listen(PORT,()=>console.log(`SPEEN ZAR running at http://localhost:${PORT}`));
