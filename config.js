GOOGLE_SCRIPT_URL:https://script.google.com/macros/s/AKfycbx6Fi6QH8pAKLWXlstBatc9O6X5Byjf99Kfpa7gy8hf91r_1qkrmzskTqNqsm9feDdkXg/exec"",
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
