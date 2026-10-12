from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
import time

def test_register():
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()))
    
    try:
        print("\n" + "="*50)
        print("🧪 TEST: REGISTRO DE USUARIO")
        print("="*50)
        
        print("\n🌐 Abriendo página de registro...")
        driver.get("http://localhost:5173/register")
        driver.maximize_window()
        
        print("⏳ Esperando que cargue la página...")
        time.sleep(3)
        
        wait = WebDriverWait(driver, 15)
        
        # Generar email único
        timestamp = int(time.time())
        test_email = f"test{timestamp}@test.com"
        test_name = f"Usuario Test {timestamp}"
        
        print(f"\n📝 Datos de prueba:")
        print(f"   Nombre: {test_name}")
        print(f"   Email: {test_email}")
        print(f"   Password: password123")
        
        print("\n✍️  Llenando formulario...")
        
        # Nombre
        try:
            name_input = wait.until(EC.presence_of_element_located(
                (By.CSS_SELECTOR, "input[id*='name'], input[placeholder*='nombre'], input[placeholder*='Nombre']")
            ))
            name_input.clear()
            name_input.send_keys(test_name)
            print("✅ Nombre ingresado")
        except Exception as e:
            print(f"❌ Error al ingresar nombre: {e}")
            return False
        
        # Email
        try:
            email_input = wait.until(EC.presence_of_element_located(
                (By.CSS_SELECTOR, "input[type='email']")
            ))
            email_input.clear()
            email_input.send_keys(test_email)
            print("✅ Email ingresado")
        except Exception as e:
            print(f"❌ Error al ingresar email: {e}")
            return False
        
        # Password
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
            print(f"❌ Error al ingresar password: {e}")
            return False
        
        # Seleccionar rol (opcional, puede fallar si no existe)
        print("\n🎯 Seleccionando rol Usuario...")
        time.sleep(1)
        try:
            user_radio = driver.find_element(
                By.XPATH, 
                "//span[contains(text(), 'Usuario')]/ancestor::label//input[@type='radio']"
            )
            driver.execute_script("arguments[0].click();", user_radio)
            print("✅ Rol Usuario seleccionado")
        except Exception as e:
            print(f"⚠️  No se pudo seleccionar rol: {str(e)[:100]}")
        
        time.sleep(1)
        
        # Enviar formulario
        print("\n📤 Enviando formulario...")
        try:
            submit_button = wait.until(EC.element_to_be_clickable(
                (By.XPATH, "//button[contains(text(), 'Crear') or @type='submit']")
            ))
            submit_button.click()
        except Exception as e:
            print(f"❌ Error al hacer clic en submit: {e}")
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
            
            # Buscar mensajes
            try:
                alerts = driver.find_elements(By.CSS_SELECTOR, ".ant-alert, .ant-message")
                for alert in alerts:
                    if alert.is_displayed():
                        print(f"⚠️  Mensaje: {alert.text}")
            except:
                pass
            
            driver.save_screenshot("register_warning.png")
            print("\n" + "="*50)
            print("⚠️  TEST REGISTRO: ADVERTENCIA")
            print("="*50)
            return False
        
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        driver.save_screenshot("register_error.png")
        print("\n" + "="*50)
        print("❌ TEST REGISTRO: ERROR")
        print("="*50)
        return False
        
    finally:
        print("\n🔒 Cerrando navegador...")
        time.sleep(2)
        driver.quit()

if __name__ == "__main__":
    success = test_register()
    exit(0 if success else 1)