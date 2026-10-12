from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
import time

def test_login():
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()))
    
    try:
        print("\n" + "="*50)
        print("🧪 TEST: LOGIN")
        print("="*50)
        
        print("\n🌐 Abriendo http://localhost:5173/login")
        driver.get("http://localhost:5173/login")
        driver.maximize_window()
        
        print("⏳ Esperando que cargue el formulario...")
        wait = WebDriverWait(driver, 15)
        
        # Esperar a que la página cargue completamente
        email_input = wait.until(EC.presence_of_element_located((By.NAME, "email")))
        password_input = wait.until(EC.presence_of_element_located((By.NAME, "password")))
        
        print("✍️  Ingresando credenciales: admin@gmail.com")
        email_input.clear()
        email_input.send_keys("admin@gmail.com")
        
        password_input.clear()
        password_input.send_keys("123456")
        
        print("📤 Enviando formulario...")
        password_input.send_keys(Keys.RETURN)
        
        print("⏳ Esperando redirección...")
        time.sleep(5)  # Aumentado a 5 segundos
        
        current_url = driver.current_url
        print(f"\n📍 URL actual: {current_url}")
        
        # Verificar que NO estamos en login
        if "login" not in current_url:
            print("✅ ÉXITO: Redirigió correctamente")
            
            # Verificar que estamos en dashboard
            if "dashboard" in current_url:
                print("✅ Usuario en Dashboard")
                
                # Verificar que el navbar cargó (nuevo diseño)
                try:
                    # Buscar el texto "Paw Friends" en el navbar
                    wait.until(EC.presence_of_element_located(
                        (By.XPATH, "//*[contains(text(), 'Paw Friends')]")
                    ))
                    print("✅ Navbar cargado correctamente")
                except:
                    print("⚠️  Navbar no encontrado, pero login exitoso")
                
                driver.save_screenshot("login_success.png")
                print("📸 Screenshot: login_success.png")
                
                print("\n" + "="*50)
                print("✅ TEST LOGIN: PASÓ")
                print("="*50)
                return True
            else:
                print(f"⚠️  Redirigió a: {current_url}")
                driver.save_screenshot("login_redirect.png")
                return True
        else:
            print("❌ FALLO: Aún en página de login")
            
            # Buscar mensajes de error
            try:
                error_msg = driver.find_element(By.CSS_SELECTOR, ".ant-alert-message, .ant-message-error")
                print(f"❌ Mensaje de error: {error_msg.text}")
            except:
                print("❌ No se encontró mensaje de error específico")
            
            driver.save_screenshot("login_error.png")
            print("\n" + "="*50)
            print("❌ TEST LOGIN: FALLÓ")
            print("="*50)
            return False
        
    except Exception as e:
        print(f"\n❌ ERROR CRÍTICO: {str(e)}")
        driver.save_screenshot("login_critical_error.png")
        print(f"📍 URL al fallar: {driver.current_url}")
        print("\n" + "="*50)
        print("❌ TEST LOGIN: ERROR")
        print("="*50)
        return False
        
    finally:
        print("\n🔒 Cerrando navegador...")
        time.sleep(2)
        driver.quit()

if __name__ == "__main__":
    success = test_login()
    exit(0 if success else 1)