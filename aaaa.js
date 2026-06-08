/*
  ═══════════════════════════════════════════════════════════════
  ملف للمراجعة فقط — aaaa.js
  ═══════════════════════════════════════════════════════════════
  ده الشكل الأصلي قبل ما الكود يتفصل لـ:
    - models/Product.js
    - controllers/Product.js
    - routes/Product.js

  دلوقتي في البروجekt كل حاجة في ملف لوحدها.
  الملف ده مش شغال لوحده — للذاكرة والمناقشة بس.
  ═══════════════════════════════════════════════════════════════
*/

// ─────────────────────────────────────────────────────────────
// الجزء 1: index.js (إعداد السيرفر + ربط الـ Product routes)
// ─────────────────────────────────────────────────────────────
const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));











// الاسكيما دي شغاله في كلو فلتعديل والمسح والاضافه وكلو 
//👉 يعني: بيتحكم في إدخال البيانات
// هنا الـ Schema:
// يتأكد الاسم موجود
// السعر مش بالسالب
// category من القايمة

// يعني مثلا وانت بتعدل مينفعش السعر يكون بلسالب وكدا 

roductSchema = new mongoose.Schema(  // الاسكيما دي الي هي فلمربعات بتاعت ال ejs 
  {
    name: { type: String, required: true, trim: true },  //لازم اسم المنتج يتكتب صح بدون فراغات زيادة
    category: {
      type: String,
      required: true,
      enum: [          //لازم تختار من قائمة معينة فقط
        "Bakeries & Pastries",
        "Dairy",
        "Fruits and Veggies",
        "Snacks",
        "Behind the Counter",
        "Beverages",
        "Beauty Essentials",
      ],
    },
    price: { type: Number, required: true, min: 0 },   // رقم لازم يتكتب و اقل حاجه 0 
    quantity: { type: Number, required: true, min: 0 },
    description: { type: String, trim: true },
    imageUrl: { type: String, trim: true, default: "/img/placeholder.png" },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);  
  //لو الموديل موجود بالفعل
//  استخدمه  
//   لو مش موجود
//   اعمله جديد  
//   📌 ليه؟
//   عشان يمنع Error اسمه:
//   OverwriteModelErro























// ─────────────────────────────────────────────────────────────
// الجزء 3: Multer — دلوقتي في middlewares/multer.js
// ─────────────────────────────────────────────────────────────
const imgDir = path.join(__dirname, "public", "img");
const uploadDir = path.join(imgDir, "upload");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single("image");

  














app.post("/products", upload, async (req, res) => {    // وده غالبًا خاص بإضافة منتج جديد للموقع، يعني Admin Panel.
  
    const productData = {  // بتتعمل لم الادمين يملي الفورم 
      ...req.body,        //بتنسخ كل الـ properties الموجودة في req.body. // لما انت بتضيف منتج بتضيف كي وفاليو ال req.body بتحطهم او تنسخهم زي مهما 
      imageUrl: `/img/upload/${req.file.filename}`,
    };

    const product = new Product(productData);  // bn3mel  const product 
    await product.save();   // await:"استنى لحد ما عملية حفظ المنتج في قاعدة البيانات تخلص، وبعد كده كمل تنفيذ الكود."
    res.status(201).json(product); // Clientالمنتج اتعمل بنجاح، وهرجع بيانات المنتج الجديد للـ    
    // 201 is a status code for created (Created)
 
});











// GET /products — Get All  ←  getProducts
app.get("/products", async (req, res) => {    // كل المنتجات 
  try {
    const products = await Product.find();
    res.json(products);    // هيبعتها بشكل جيسون الي هو كي وفاليو 
  } catch (error) {
    res.status(500).json({ error: error.message });  // 500 = Internal Server Error
  }
});



app.get("/products/:id", async (req, res) => {    //   Product.findById("1") السيرفر ينفذ GET /products/1 بترجع منتج منتج حسب الايدي // المستخدم شاف اللبن وضغط عليه الفرونت اند يعرف الايدي بتاعه فيبعت 
 
    const product = await Product.findById(req.params.id);  // req.params.id الي بتجيب ال ايدي  // GET /products/123  =>  will be id 123
    if (!product) return res.status(404).json({ message: "Product not found" });  // 404 = Not Found
    res.json(product);

});








app.put("/products/:id", async (req, res) => {
  
      const updateData = { ...req.body };         
      if (req.file) {    // هل الأدمن رفع صورة جديدة؟
        updateData.imageUrl = `/img/upload/${req.file.filename}`;
      }
      const product = await Product.findByIdAndUpdate(req.params.id, updateData, {  // تحديث المنتج 
        new: true,
        runValidators: true,
      });
      if (!product) return res.status(404).json({ message: "Product not found" });
      res.json(product);
 
  });




//   updateData
//   const updateData = { ...req.body };
  
//   لو الفرونت بعت:
  
//   {
//     "name": "Milk",
//     "price": 30
//   }
  
//   يبقى:
  
//   updateData = {
//     name: "Milk",
//     price: 30
//   }
  
//   يعني نسخنا البيانات الجديدة.












app.delete("/products/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);  //req.params.id = DELETE /products/123 
    if (!product) return res.status(404).json({ message: "Product not found" }); 
    res.json({ message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });  // 500 = Internal Server Error
  }
});












// ─────────────────────────────────────────────────────────────
// الجزء 5: تشغيل السيرفر — من index.js
// ─────────────────────────────────────────────────────────────
// app.listen(3000, () => {
//   connectDB();
//   console.log("Server on port 3000");
// });

/*
  ═══════════════════════════════════════════════════════════════
  خريطة: إيه اتفصل فين؟
  ═══════════════════════════════════════════════════════════════

  aaaa.js (الأصل)                    →  البروجekt دلوقتي
  ─────────────────────────────────────────────────────────────
  productSchema + Product model        →  models/Product.js
  createProduct, getProducts, ...      →  controllers/Product.js
  app.post/get/put/delete("/products") →  routes/Product.js
  upload (multer)                      →  middlewares/multer.js
  app.use + listen                     →  index.js

  ═══════════════════════════════════════════════════════════════
  routes/Product.js بعد التفصيل (للمقارنة):
  ═══════════════════════════════════════════════════════════════

  const router = express.Router();

  router.post("/products", upload, createProduct);
  router.get("/products", getProducts);
  router.get("/products/:id", getProductById);
  router.put("/products/:id", updateProduct);
  router.delete("/products/:id", deleteProduct);

  module.exports = router;

  ─── وفي index.js ───
  const productRouter = require("./routes/Product.js");
  app.use("/", productRouter);

  ═══════════════════════════════════════════════════════════════
*/
