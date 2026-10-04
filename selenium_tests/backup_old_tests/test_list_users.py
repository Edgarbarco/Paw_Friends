from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
import time

driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()))

try:
    # Login
    print("🔑 Haciendo login como admin...")
    driver.get("http://localhost:5173/login")
    driver.maximize_window()
    
    wait = WebDriverWait(driver, 10)
    
    email_input = wait.until(EC.presence_of_element_located((By.NAME, "email")))
    password_input = driver.find_element(By.NAME, "password")
    
    email_input.send_keys("admin@gmail.com")
    password_input.send_keys("123456")
    password_input.submit()
    
    time.sleep(4)
    print("✅ Login exitoso")
    
    # Ir a usuarios
    print("📍 Navegando a Administrar Usuarios...")
    driver.get("http://localhost:5173/dashboard/users")
    
    time.sleep(4)
    
    current_url = driver.current_url
    print(f"📍 URL actual: {current_url}")
    
    # Verificar que no redirigió a login
    if "login" in current_url:
        print("❌ Redirigió a login - Sesión perdida")
        driver.save_screenshot("session_lost.png")
    else:
        print("✅ Página de usuarios cargada")
        
        # Verificar contenido
        print("🔍 Verificando contenido...")
        
        page_text = driver.page_source.lower()
        
        checks = [
            ("Texto 'admin' visible", "admin" in page_text),
            ("Estructura de página", len(page_text) > 1000),
            ("No hay error 404", "404" not in page_text and "not found" not in page_text),
        ]
        
        for check_name, result in checks:
            status = "✅" if result else "❌"
            print(f"{status} {check_name}")
        
        # Contar elementos que parecen usuarios
        try:
            # Buscar elementos que contengan "admin" o "@"
            user_elements = driver.find_elements(By.XPATH, "//*[contains(text(), '@') or contains(text(), 'admin') or contains(text(), 'user')]")
            print(f"📊 Elementos con datos de usuarios: {len(user_elements)}")
        except:
            print("⚠️  No se pudieron contar elementos")
        
        # Tomar screenshot
        driver.save_screenshot("users_page_success.png")
        print("📸 Screenshot guardado como 'users_page_success.png'")
    
    time.sleep(3)

except Exception as e:
    print(f"❌ Error: {e}")
    driver.save_screenshot("error_users.png")

finally:
    print("🔒 Cerrando navegador...")
    driver.quit()
    print("✅ Test completado")