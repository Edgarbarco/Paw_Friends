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

def test_navigation():
    print("\n" + "="*50)
    print("🧪 TEST: NAVEGACIÓN")
    print("="*50)
    
    print("\n🔍 Verificando que el frontend esté corriendo...")
    if not check_server_running():
        print("❌ ERROR: El frontend NO está corriendo en http://localhost:5173")
        print("📌 Solución: Ejecuta 'npm run dev' en la carpeta Cliente")
        print("\n" + "="*50)
        print("❌ TEST NAVEGACIÓN: ERROR (Frontend no disponible)")
        print("="*50)
        return False
    
    print("✅ Frontend detectado en http://localhost:5173")
    
    driver = None
    try:
        driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()))
        
        print("\n🔑 Haciendo login...")
        driver.get("http://localhost:5173/login")
        driver.maximize_window()
        
        wait = WebDriverWait(driver, 15)
        
        email_input = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='email']")))
        password_input = driver.find_element(By.CSS_SELECTOR, "input[type='password']")
        
        email_input.send_keys("admin@gmail.com")
        password_input.send_keys("123456")
        password_input.submit()
        
        time.sleep(6)
        print("✅ Login completado")
        
        print("\n🧭 Probando navegación entre rutas...")
        
        rutas = [
            ("Dashboard", "http://localhost:5173/dashboard"),
            ("Agenda", "http://localhost:5173/dashboard/agenda"),
            ("Inventario", "http://localhost:5173/dashboard/inventory"),
            ("Mascotas", "http://localhost:5173/dashboard/pets"),
        ]
        
        passed = 0
        failed = 0
        
        for nombre, url in rutas:
            print(f"\n📍 Probando: {nombre}...")
            driver.get(url)
            time.sleep(3)
            
            current_url = driver.current_url
            
            if "login" not in current_url:
                print(f"   ✅ {nombre} - Acceso correcto")
                print(f"   URL: {current_url}")
                passed += 1
            else:
                print(f"   ❌ {nombre} - Redirigió a login (sesión perdida)")
                failed += 1
        
        print("\n" + "="*50)
        print(f"📊 Resultado: {passed}/{len(rutas)} rutas accesibles")
        print("="*50)
        
        if passed >= len(rutas) - 1:
            print("✅ TEST NAVEGACIÓN: PASÓ")
            driver.save_screenshot("navigation_success.png")
            return True
        else:
            print("❌ TEST NAVEGACIÓN: FALLÓ")
            driver.save_screenshot("navigation_failed.png")
            return False
        
    except Exception as e:
        print(f"\n❌ ERROR: {type(e).__name__}: {str(e)[:200]}")
        if driver:
            driver.save_screenshot("navigation_error.png")
        print("\n" + "="*50)
        print("❌ TEST NAVEGACIÓN: ERROR")
        print("="*50)
        return False
        
    finally:
        if driver:
            print("\n🔒 Cerrando navegador...")
            time.sleep(2)
            driver.quit()

if __name__ == "__main__":
    success = test_navigation()
    exit(0 if success else 1)
