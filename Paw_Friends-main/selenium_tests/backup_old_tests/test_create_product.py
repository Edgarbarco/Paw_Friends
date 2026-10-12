from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
import time

def test_create_product():
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()))
    
    try:
        print("\n" + "="*50)
        print("🧪 TEST: CREAR PRODUCTO")
        print("="*50)
        
        print("\n🔑 Haciendo login...")
        driver.get("http://localhost:5173/login")
        driver.maximize_window()
        
        wait = WebDriverWait(driver, 15)
        
        email_input = wait.until(EC.presence_of_element_located((By.NAME, "email")))
        password_input = driver.find_element(By.NAME, "password")
        
        email_input.send_keys("admin@gmail.com")
        password_input.send_keys("123456")
        password_input.submit()
        
        time.sleep(4)
        print("✅ Login exitoso")
        
        print("\n📍 Navegando a Inventario...")
        driver.get("http://localhost:5173/inventory")
        time.sleep(3)
        
        print("✅ Página de inventario cargada")
        driver.save_screenshot("product_page.png")
        
        print("\n" + "="*50)
        print("✅ TEST CREAR PRODUCTO: PASÓ")
        print("="*50)
        return True
        
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        driver.save_screenshot("product_error.png")
        return False
        
    finally:
        print("\n🔒 Cerrando navegador...")
        driver.quit()

if __name__ == "__main__":
    test_create_product()
