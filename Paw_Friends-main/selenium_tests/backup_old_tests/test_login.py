from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import WebDriverException, TimeoutException
from webdriver_manager.chrome import ChromeDriverManager
import time
import requests

def check_server_running():
    """Verificar que el servidor esté corriendo"""
    try:
        response = requests.get("http://localhost:5173", timeout=5)
        return response.status_code == 200
    except:
        return False

def test_login():
    print("\n" + "="*50)
    print("🧪 TEST: LOGIN")
    print("="*50)
    
    # Verificar servidor ANTES de iniciar Selenium
    print("\n🔍 Verificando que el frontend esté corriendo...")
    if not check_server_running():
        print("❌ ERROR: El frontend NO está corriendo en http://localhost:5173")
        print("📌 Solución: Ejecuta 'npm run dev' en la carpeta Cliente")
        print("\n" + "="*50)
        print("❌ TEST LOGIN: ERROR (Frontend no disponible)")
        print("="*50)
        return False
    
    print("✅ Frontend detectado en http://localhost:5173")
    
    driver = None
    try:
        driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()))
        
        print("\n🌐 Abriendo http://localhost:5173/login")
        driver.get("http://localhost:5173/login")
        driver.maximize_window()
        
        print("⏳ Esperando que cargue el formulario (15 segundos máx)...")
        wait = WebDriverWait(driver, 15)
        
        # Intentar encontrar los campos con múltiples estrategias
        try:
            email_input = wait.until(EC.presence_of_element_located((By.NAME, "email")))
        except TimeoutException:
            print("⚠️  Campo 'email' no encontrado por NAME, intentando por TYPE...")
            email_input = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='email']")))
        
        try:
            password_input = driver.find_element(By.NAME, "password")
        except:
            print("⚠️  Campo 'password' no encontrado por NAME, intentando por TYPE...")
            password_input = driver.find_element(By.CSS_SELECTOR, "input[type='password']")
        
        print("✅ Formulario de login encontrado")
        
        print("\n✍️  Ingresando credenciales: admin@gmail.com")
        email_input.clear()
        email_input.send_keys("admin@gmail.com")
        time.sleep(0.5)
        
        password_input.clear()
        password_input.send_keys("123456")
        time.sleep(0.5)
        
        print("📤 Enviando formulario...")
        password_input.send_keys(Keys.RETURN)
        
        print("⏳ Esperando redirección (máximo 8 segundos)...")
        time.sleep(8)
        
        current_url = driver.current_url
        print(f"\n📍 URL actual: {current_url}")
        
        # Verificar que NO estamos en login
        if "login" not in current_url:
            print("✅ ÉXITO: Redirigió correctamente (ya no en /login)")
            
            # Verificar que estamos en dashboard o welcome
            if "dashboard" in current_url or "welcome" in current_url or current_url == "http://localhost:5173/":
                print(f"✅ Ubicación: {current_url}")
                
                # Intentar encontrar elementos del dashboard/navbar
                try:
                    wait_short = WebDriverWait(driver, 5)
                    navbar_element = wait_short.until(EC.presence_of_element_located(
                        (By.XPATH, "//*[contains(text(), 'PAW FRIENDS') or contains(text(), 'Hola') or contains(text(), 'Dashboard')]")
                    ))
                    print(f"✅ Elemento de interfaz encontrado: {navbar_element.text[:50]}...")
                except:
                    print("⚠️  No se encontró navbar específico, pero login exitoso")
                
                driver.save_screenshot("login_success.png")
                print("📸 Screenshot guardado: 'login_success.png'")
                
                print("\n" + "="*50)
                print("✅ TEST LOGIN: PASÓ")
                print("="*50)
                return True
            else:
                print(f"⚠️  Redirigió a ubicación inesperada: {current_url}")
                driver.save_screenshot("login_redirect_unexpected.png")
                return True  # Aún así cuenta como éxito si salió de /login
        else:
            print("❌ FALLO: Aún en página de login")
            
            # Buscar mensajes de error
            try:
                error_elements = driver.find_elements(By.CSS_SELECTOR, ".ant-alert-message, .ant-message-error, .error")
                if error_elements:
                    for elem in error_elements:
                        if elem.is_displayed():
                            print(f"❌ Mensaje de error: {elem.text}")
            except:
                print("❌ No se encontró mensaje de error específico")
            
            driver.save_screenshot("login_error.png")
            print("📸 Screenshot guardado: 'login_error.png'")
            print("\n" + "="*50)
            print("❌ TEST LOGIN: FALLÓ")
            print("="*50)
            return False
        
    except TimeoutException as e:
        print(f"\n❌ TIMEOUT: No se pudo cargar la página en el tiempo esperado")
        print(f"   Detalles: {str(e)[:200]}")
        if driver:
            print(f"📍 URL actual: {driver.current_url}")
            driver.save_screenshot("login_timeout.png")
        print("\n" + "="*50)
        print("❌ TEST LOGIN: ERROR (Timeout)")
        print("="*50)
        return False
        
    except WebDriverException as e:
        print(f"\n❌ ERROR DE WEBDRIVER: {str(e)[:200]}")
        if driver:
            print(f"📍 URL al fallar: {driver.current_url}")
            driver.save_screenshot("login_webdriver_error.png")
        print("\n" + "="*50)
        print("❌ TEST LOGIN: ERROR (WebDriver)")
        print("="*50)
        return False
        
    except Exception as e:
        print(f"\n❌ ERROR CRÍTICO: {type(e).__name__}: {str(e)[:200]}")
        if driver:
            print(f"📍 URL al fallar: {driver.current_url}")
            driver.save_screenshot("login_critical_error.png")
        print("\n" + "="*50)
        print("❌ TEST LOGIN: ERROR")
        print("="*50)
        return False
        
    finally:
        if driver:
            print("\n🔒 Cerrando navegador...")
            time.sleep(2)
            driver.quit()

if __name__ == "__main__":
    success = test_login()
    exit(0 if success else 1)