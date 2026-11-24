
const CONFIG = {
  // ใส่ URL ของ Google Apps Script Web App ภายหลัง
  GOOGLE_SCRIPT_URL: "",

  // สกุลเงินของร้านค้า
  CURRENCY: "THB",

  // ข้อมูลสินค้าเริ่มต้น
  PRODUCTS: [
    {
      id: "SC-MINT-01",
      name: "Fresh Mint",
      description: "ยาสีฟันเฟรชมินต์ เพิ่มความสดชื่น",
      price: 89,
      stock: 30,
      type: "mint"
    },
    {
      id: "SC-HERB-02",
      name: "Herbal Care",
      description: "ยาสีฟันสมุนไพร ดูแลช่องปากทุกวัน",
      price: 99,
      stock: 24,
      type: "herbal"
    }
  ]
};
