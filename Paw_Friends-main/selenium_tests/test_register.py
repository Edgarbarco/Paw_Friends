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

def test_register():
    print("\n" + "="*50)
    print("🧪 TEST: REGISTRO DE USUARIO")
    print("="*50)
    
    print("\n🔍 Verificando que el frontend esté corriendo...")
    if not check_server_running():
        print("❌ ERROR: El frontend NO está corriendo en http://localhost:5173")
        print("📌 Solución: Ejecuta 'npm run dev' en la carpeta Cliente")
        print("\n" + "="*50)
        print("❌ TEST REGISTRO: ERROR (Frontend no disponible)")
        print("="*50)
        return False
    
    print("✅ Frontend detectado en http://localhost:5173")
    
    driver = None
    try:
        driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()))
        
        print("\n🌐 Abriendo página de registro...")
        driver.get("http://localhost:5173/register")
        driver.maximize_window()
        
        print("⏳ Esperando que cargue la página...")
        time.sleep(3)
        
        wait = WebDriverWait(driver, 15)
        
        timestamp = int(time.time())
        test_email = f"test{timestamp}@test.com"
        test_name = f"Usuario Test {timestamp}"
        
        print(f"\n📝 Datos de prueba:")
        print(f"   Nombre: {test_name}")
        print(f"   Email: {test_email}")
        print(f"   Password: password123")
        
        print("\n✍️  Llenando formulario...")
        
        try:
            name_input = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "input[id*='name'], input[placeholder*='nombre'], input[placeholder*='Nombre']")))
            name_input.clear()
            name_input.send_keys(test_name)
            print("✅ Nombre ingresado")
        except Exception as e:
            print(f"❌ Error al ingresar nombre: {str(e)[:100]}")
            return False
        
        try:
            email_input = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='email']")))
            email_input.clear()
            email_input.send_keys(test_email)
            print("✅ Email ingresado")
        except Exception as e:
            print(f"❌ Error al ingresar email: {str(e)[:100]}")
            return False
        
        try:
            password_inputs = driver.find_elements(By.CSS_SELECTOR, "input[type='password']")
            if len(password_inputs) >= 2:
                password_inputs[0].clear()
                password_inputs[0].send_keys("password123")
                print("✅ Password ingresado")
                
                password_inputs[1].clear()
                password_inputs[1].send_keys("password123")
                print("✅ Confirmación de password ingresada")
            else:
                print("⚠️  Solo se encontró un campo de password")
                password_inputs[0].send_keys("password123")
        except Exception as e:
            print(f"❌ Error al ingresar password: {str(e)[:100]}")
            return False
        
        print("\n🎯 Seleccionando rol Usuario...")
        time.sleep(2)
        try:
            # Intentar varios selectores para el radio button
            selectors = [
                "//input[@type='radio' and @value='user']",
                "//input[@type='radio'][1]",
                "//label[contains(., 'Usuario')]//input[@type='radio']",
                ".ant-radio-input[value='user']"
            ]
            
            clicked = False
            for selector in selectors:
                try:
                    if selector.startswith("//"):
                        user_radio = driver.find_element(By.XPATH, selector)
                    else:
                        user_radio = driver.find_element(By.CSS_SELECTOR, selector)
                    
                    # Scroll hacia el elemento
                    driver.execute_script("arguments[0].scrollIntoView(true);", user_radio)
                    time.sleep(0.5)
                    
                    # Intentar hacer clic con JavaScript
                    driver.execute_script("arguments[0].click();", user_radio)
                    print("✅ Rol Usuario seleccionado")
                    clicked = True
                    break
                except:
                    continue
            
            if not clicked:
                print("⚠️  No se pudo seleccionar rol, continuando sin selección...")
                
        except Exception as e:
            print(f"⚠️  Error al seleccionar rol: {str(e)[:100]}")
        
        time.sleep(1)
        
        print("\n📤 Enviando formulario...")
        time.sleep(1)
        try:
            # Buscar el botón de submit
            submit_button = wait.until(EC.presence_of_element_located((By.XPATH, "//button[contains(text(), 'Crear') or @type='submit']")))
            
            # Scroll hacia el botón
            driver.execute_script("arguments[0].scrollIntoView(true);", submit_button)
            time.sleep(1)
            
            # Intentar click normal primero
            try:
                submit_button.click()
                print("✅ Formulario enviado (click normal)")
            except:
                # Si falla, usar JavaScript
                driver.execute_script("arguments[0].click();", submit_button)
                print("✅ Formulario enviado (JavaScript click)")
                
        except Exception as e:
            print(f"❌ Error al enviar formulario: {str(e)[:100]}")
            driver.save_screenshot("submit_error.png")
            return False
        
        print("⏳ Esperando resultado...")
        time.sleep(5)
        
        current_url = driver.current_url
        print(f"\n📍 URL actual: {current_url}")
        
        if "register" not in current_url:
            print(f"✅ ÉXITO: Registro completado")
            print(f"   Usuario creado: {test_email}")
            driver.save_screenshot("register_success.png")
            print("📸 Screenshot guardado: 'register_success.png'")
            
            print("\n" + "="*50)
            print("✅ TEST REGISTRO: PASÓ")
            print("="*50)
            return True
        else:
            print("⚠️  Aún en página de registro")
            driver.save_screenshot("register_warning.png")
            print("\n" + "="*50)
            print("⚠️  TEST REGISTRO: ADVERTENCIA")
            print("="*50)
            return False
        
    except Exception as e:
        print(f"\n❌ ERROR: {type(e).__name__}: {str(e)[:200]}")
        if driver:
            driver.save_screenshot("register_error.png")
        print("\n" + "="*50)
        print("❌ TEST REGISTRO: ERROR")
        print("="*50)
        return False
        
    finally:
        if driver:
            print("\n🔒 Cerrando navegador...")
            time.sleep(2)
            driver.quit()

if __name__ == "__main__":
    success = test_register()
    exit(0 if success else 1)