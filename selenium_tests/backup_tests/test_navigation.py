from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
import time

def test_navigation():
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()))
    
    try:
        print("\n" + "="*50)
        print("🧪 TEST: NAVEGACIÓN")
        print("="*50)
        
        # Login primero
        print("\n🔑 Haciendo login...")
        driver.get("http://localhost:5173/login")
        driver.maximize_window()
        
        wait = WebDriverWait(driver, 15)
        
        email_input = wait.until(EC.presence_of_element_located((By.NAME, "email")))
        password_input = driver.find_element(By.NAME, "password")
        
        email_input.send_keys("admin@gmail.com")
        password_input.send_keys("123456")
        password_input.submit()
        
        time.sleep(5)
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
        
        if passed >= len(rutas) - 1:  # Al menos 3 de 4
            print("✅ TEST NAVEGACIÓN: PASÓ")
            driver.save_screenshot("navigation_success.png")
            return True
        else:
            print("❌ TEST NAVEGACIÓN: FALLÓ")
            driver.save_screenshot("navigation_failed.png")
            return False
        
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        driver.save_screenshot("navigation_error.png")
        print("\n" + "="*50)
        print("❌ TEST NAVEGACIÓN: ERROR")
        print("="*50)
        return False
        
    finally:
        print("\n🔒 Cerrando navegador...")
        time.sleep(2)
        driver.quit()

if __name__ == "__main__":
    success = test_navigation()
    exit(0 if success else 1)