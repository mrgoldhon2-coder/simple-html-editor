// Адрес твоего сервера на VPS. Когда запустишь бэкенд, заменишь на реальный IP или домен.
const API_URL = "http://localhost:5000"; 

export const Api = {
  // Функция создания заявки
  createOrder: async (orderData: any) => {
    try {
      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });
      return await response.json();
    } catch (error) {
      console.error("Ошибка API:", error);
      return { success: false, message: "Сервер недоступен" };
    }
  },

  // Функция получения курсов (для будущего)
  getRates: async () => {
    const res = await fetch(`${API_URL}/rates`);
    return await res.json();
  }
};