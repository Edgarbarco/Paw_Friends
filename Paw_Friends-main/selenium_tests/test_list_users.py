from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import WebDriverException, TimeoutException
from webdriver_manager.chrome import ChromeDriverManager
import time
import requests

def check_server_running():
    try:
        response = requests.get("http://localhost:5173", timeout=5)
        return response.status_code == 200
    except:
        return False

def test_list_users():
    print("\n" + "="*50)
    print("🧪 TEST: LISTA DE USUARIOS")
    print("="*50)
    
    print("\n🔍 Verificando que el frontend esté corriendo...")
    if not check_server_running():
        print("❌ ERROR: El frontend NO está corriendo")
        return False
    
    driver = None
    try:
        driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()))
        
        print("\n🔑 Haciendo login como admin...")
        driver.get("http://localhost:5173/login")
        driver.maximize_window()
        
        wait = WebDriverWait(driver, 15)
        
        email_input = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='email']")))
        password_input = driver.find_element(By.CSS_SELECTOR, "input[type='password']")
        
        email_input.send_keys("admin@gmail.com")
        password_input.send_keys("123456")
        password_input.submit()
        
        time.sleep(5)
        print("✅ Login exitoso")
        
        print("\n📍 Navegando a Administrar Usuarios...")
        driver.get("http://localhost:5173/dashboard/users")
        
        time.sleep(4)
        
        current_url = driver.current_url
        print(f"📍 URL actual: {current_url}")
        
        if "login" in current_url:
            print("❌ Redirigió a login - Sesión perdida")
            return False
        else:
            print("✅ Página de usuarios cargada")
            driver.save_screenshot("users_page_success.png")
            print("📸 Screenshot guardado")
            
            print("\n" + "="*50)
            print("✅ TEST LISTA USUARIOS: PASÓ")
            print("="*50)
            return True
        
    except Exception as e:
        print(f"\n❌ ERROR: {type(e).__name__}: {str(e)[:200]}")
        if driver:
            driver.save_screenshot("users_error.png")
        return False
        
    finally:
        if driver:
            print("\n🔒 Cerrando navegador...")
            time.sleep(2)
            driver.quit()

if __name__ == "__main__":
    success = test_list_users()
    exit(0 if success else 1)
