from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
import time

def test_create_pet():
    """Test para crear una nueva mascota"""
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()))
    
    try:
        print("\n" + "="*50)
        print("🧪 TEST: CREAR MASCOTA")
        print("="*50)
        
        # Login
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
        
        # Ir a mascotas
        print("\n📍 Navegando a Mascotas...")
        driver.get("http://localhost:5173/pets")
        time.sleep(3)
        
        # Buscar botón de agregar/crear
        print("\n🔍 Buscando botón 'Agregar Mascota'...")
        try:
            add_button = wait.until(EC.element_to_be_clickable(
                (By.XPATH, "//button[contains(text(), 'Agregar') or contains(text(), 'Crear') or contains(text(), 'Nueva')]")
            ))
            add_button.click()
            print("✅ Botón 'Agregar' clickeado")
            time.sleep(2)
        except Exception as e:
            print(f"❌ No se encontró botón agregar: {e}")
            driver.save_screenshot("pet_no_button.png")
            return False
        
        # Llenar formulario
        print("\n✍️  Llenando formulario de mascota...")
        
        timestamp = int(time.time())
        pet_data = {
            "name": f"Max Test {timestamp}",
            "species": "Perro",
            "breed": "Golden Retriever",
            "age": "3",
            "weight": "30",
            "ownerName": "Juan Pérez",
            "ownerPhone": "5555-1234",
            "ownerEmail": f"juan{timestamp}@ejemplo.com"
        }
        
        # Llenar cada campo
        for field_name, field_value in pet_data.items():
            try:
                field = driver.find_element(By.NAME, field_name)
                field.clear()
                field.send_keys(field_value)
                print(f"   ✅ {field_name}: {field_value}")
            except:
                try:
                    field = driver.find_element(By.ID, field_name)
                    field.clear()
                    field.send_keys(field_value)
                    print(f"   ✅ {field_name}: {field_value}")
                except Exception as e:
                    print(f"   ⚠️  No se encontró campo {field_name}")
        
        time.sleep(1)
        
        # Enviar formulario
        print("\n📤 Enviando formulario...")
        try:
            submit_button = wait.until(EC.element_to_be_clickable(
                (By.XPATH, "//button[contains(text(), 'Crear') or contains(text(), 'Guardar') or @type='submit']")
            ))
            submit_button.click()
            print("✅ Formulario enviado")
        except Exception as e:
            print(f"❌ No se pudo enviar: {e}")
            driver.save_screenshot("pet_no_submit.png")
            return False
        
        # Esperar resultado
        print("\n⏳ Esperando resultado...")
        time.sleep(4)
        
        # Verificar que la mascota se agregó
        page_text = driver.page_source.lower()
        
        if pet_data["name"].lower() in page_text:
            print(f"✅ ÉXITO: Mascota '{pet_data['name']}' encontrada en la lista")
            driver.save_screenshot("pet_created_success.png")
            print("📸 Screenshot: 'pet_created_success.png'")
            
            print("\n" + "="*50)
            print("✅ TEST CREAR MASCOTA: PASÓ")
            print("="*50)
            return True
        else:
            print("⚠️  No se encontró la mascota en la lista")
            
            # Buscar mensajes de éxito
            try:
                success_msgs = driver.find_elements(By.CSS_SELECTOR, ".ant-message-success, .ant-notification-success")
                if success_msgs:
                    print("✅ Se encontró mensaje de éxito")
                    driver.save_screenshot("pet_success_message.png")
                    return True
            except:
                pass
            
            driver.save_screenshot("pet_not_found.png")
            print("📸 Screenshot: 'pet_not_found.png'")
            
            print("\n" + "="*50)
            print("⚠️  TEST CREAR MASCOTA: ADVERTENCIA")
            print("="*50)
            return False
        
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        driver.save_screenshot("pet_error.png")
        print("\n" + "="*50)
        print("❌ TEST CREAR MASCOTA: ERROR")
        print("="*50)
        return False
        
    finally:
        print("\n🔒 Cerrando navegador...")
        driver.quit()


# ============================================
# test_create_appointment.py - NUEVO
# ============================================
def test_create_appointment():
    """Test para crear una nueva cita"""
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()))
    
    try:
        print("\n" + "="*50)
        print("🧪 TEST: CREAR CITA")
        print("="*50)
        
        # Login
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
        
        # Ir a agenda/citas
        print("\n📍 Navegando a Agenda...")
        driver.get("http://localhost:5173/agenda")
        time.sleep(3)
        
        # Buscar botón de agregar cita
        print("\n🔍 Buscando botón 'Agregar Cita'...")
        try:
            add_button = wait.until(EC.element_to_be_clickable(
                (By.XPATH, "//button[contains(text(), 'Agregar') or contains(text(), 'Nueva') or contains(text(), 'Crear')]")
            ))
            add_button.click()
            print("✅ Botón 'Agregar' clickeado")
            time.sleep(2)
        except Exception as e:
            print(f"❌ No se encontró botón agregar: {e}")
            driver.save_screenshot("appointment_no_button.png")
            return False
        
        # Llenar formulario
        print("\n✍️  Llenando formulario de cita...")
        
        timestamp = int(time.time())
        appointment_data = {
            "petName": "Max",
            "ownerName": "Juan Pérez",
            "phone": "5555-1234",
            "email": f"juan{timestamp}@ejemplo.com",
            "service": "Vacunación",
            "notes": "Primera dosis de vacuna triple"
        }
        
        # Llenar cada campo
        for field_name, field_value in appointment_data.items():
            try:
                field = driver.find_element(By.NAME, field_name)
                field.clear()
                field.send_keys(field_value)
                print(f"   ✅ {field_name}: {field_value}")
            except:
                try:
                    field = driver.find_element(By.ID, field_name)
                    field.clear()
                    field.send_keys(field_value)
                    print(f"   ✅ {field_name}: {field_value}")
                except:
                    print(f"   ⚠️  No se encontró campo {field_name}")
        
        # Seleccionar fecha (si hay date picker)
        try:
            date_field = driver.find_element(By.CSS_SELECTOR, "input[type='date'], .ant-picker-input input")
            date_field.click()
            time.sleep(1)
            date_field.send_keys("2025-10-25")
            print("   ✅ Fecha seleccionada")
        except:
            print("   ⚠️  No se pudo seleccionar fecha")
        
        time.sleep(1)
        
        # Enviar formulario
        print("\n📤 Enviando formulario...")
        try:
            submit_button = wait.until(EC.element_to_be_clickable(
                (By.XPATH, "//button[contains(text(), 'Crear') or contains(text(), 'Guardar') or contains(text(), 'Agendar')]")
            ))
            submit_button.click()
            print("✅ Formulario enviado")
        except Exception as e:
            print(f"❌ No se pudo enviar: {e}")
            driver.save_screenshot("appointment_no_submit.png")
            return False
        
        # Esperar resultado
        print("\n⏳ Esperando resultado...")
        time.sleep(4)
        
        # Verificar que la cita se agregó
        page_text = driver.page_source.lower()
        
        if appointment_data["ownerName"].lower() in page_text or appointment_data["service"].lower() in page_text:
            print(f"✅ ÉXITO: Cita para '{appointment_data['ownerName']}' encontrada")
            driver.save_screenshot("appointment_created_success.png")
            print("📸 Screenshot: 'appointment_created_success.png'")
            
            print("\n" + "="*50)
            print("✅ TEST CREAR CITA: PASÓ")
            print("="*50)
            return True
        else:
            print("⚠️  No se encontró la cita en la lista")
            
            # Buscar mensajes de éxito
            try:
                success_msgs = driver.find_elements(By.CSS_SELECTOR, ".ant-message-success, .ant-notification-success")
                if success_msgs:
                    print("✅ Se encontró mensaje de éxito")
                    driver.save_screenshot("appointment_success_message.png")
                    return True
            except:
                pass
            
            driver.save_screenshot("appointment_not_found.png")
            print("📸 Screenshot: 'appointment_not_found.png'")
            
            print("\n" + "="*50)
            print("⚠️  TEST CREAR CITA: ADVERTENCIA")
            print("="*50)
            return False
        
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        driver.save_screenshot("appointment_error.png")
        print("\n" + "="*50)
        print("❌ TEST CREAR CITA: ERROR")
        print("="*50)
        return False
        
    finally:
        print("\n🔒 Cerrando navegador...")
        driver.quit()


# ============================================
# test_create_product.py - NUEVO
# ============================================
def test_create_product():
    """Test para crear un nuevo producto en inventario"""
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()))
    
    try:
        print("\n" + "="*50)
        print("🧪 TEST: CREAR PRODUCTO")
        print("="*50)
        
        # Login
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
        
        # Ir a inventario
        print("\n📍 Navegando a Inventario...")
        driver.get("http://localhost:5173/inventory")
        time.sleep(3)
        
        # Buscar botón de agregar producto
        print("\n🔍 Buscando botón 'Agregar Producto'...")
        try:
            add_button = wait.until(EC.element_to_be_clickable(
                (By.XPATH, "//button[contains(text(), 'Agregar') or contains(text(), 'Crear') or contains(text(), 'Nuevo')]")
            ))
            add_button.click()
            print("✅ Botón 'Agregar' clickeado")
            time.sleep(2)
        except Exception as e:
            print(f"❌ No se encontró botón agregar: {e}")
            driver.save_screenshot("product_no_button.png")
            return False
        
        # Llenar formulario
        print("\n✍️  Llenando formulario de producto...")
        
        timestamp = int(time.time())
        product_data = {
            "name": f"Vacuna Test {timestamp}",
            "description": "Vacuna de prueba Selenium",
            "category": "Vacunas",
            "type": "Inyectable",
            "stock": "50",
            "quantity": "10",
            "price": "150.00"
        }
        
        # Llenar cada campo
        for field_name, field_value in product_data.items():
            try:
                field = driver.find_element(By.NAME, field_name)
                field.clear()
                field.send_keys(field_value)
                print(f"   ✅ {field_name}: {field_value}")
            except:
                try:
                    field = driver.find_element(By.ID, field_name)
                    field.clear()
                    field.send_keys(field_value)
                    print(f"   ✅ {field_name}: {field_value}")
                except:
                    print(f"   ⚠️  No se encontró campo {field_name}")
        
        # Seleccionar fecha de ingreso
        try:
            date_field = driver.find_element(By.NAME, "entryDate")
            date_field.click()
            time.sleep(1)
            # Seleccionar fecha de hoy
            today_button = driver.find_element(By.CSS_SELECTOR, ".ant-picker-today-btn")
            today_button.click()
            print("   ✅ Fecha seleccionada")
        except:
            print("   ⚠️  No se pudo seleccionar fecha")
        
        time.sleep(1)
        
        # Enviar formulario
        print("\n📤 Enviando formulario...")
        try:
            submit_button = wait.until(EC.element_to_be_clickable(
                (By.XPATH, "//button[contains(text(), 'Crear') or contains(text(), 'Guardar')]")
            ))
            submit_button.click()
            print("✅ Formulario enviado")
        except Exception as e:
            print(f"❌ No se pudo enviar: {e}")
            driver.save_screenshot("product_no_submit.png")
            return False
        
        # Esperar resultado
        print("\n⏳ Esperando resultado...")
        time.sleep(4)
        
        # Verificar que el producto se agregó
        page_text = driver.page_source.lower()
        
        if product_data["name"].lower() in page_text:
            print(f"✅ ÉXITO: Producto '{product_data['name']}' encontrado en la lista")
            driver.save_screenshot("product_created_success.png")
            print("📸 Screenshot: 'product_created_success.png'")
            
            print("\n" + "="*50)
            print("✅ TEST CREAR PRODUCTO: PASÓ")
            print("="*50)
            return True
        else:
            print("⚠️  No se encontró el producto en la lista")
            
            # Buscar mensajes de éxito
            try:
                success_msgs = driver.find_elements(By.CSS_SELECTOR, ".ant-message-success, .ant-notification-success")
                if success_msgs:
                    print("✅ Se encontró mensaje de éxito")
                    driver.save_screenshot("product_success_message.png")
                    return True
            except:
                pass
            
            driver.save_screenshot("product_not_found.png")
            print("📸 Screenshot: 'product_not_found.png'")
            
            print("\n" + "="*50)
            print("⚠️  TEST CREAR PRODUCTO: ADVERTENCIA")
            print("="*50)
            return False
        
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        driver.save_screenshot("product_error.png")
        print("\n" + "="*50)
        print("❌ TEST CREAR PRODUCTO: ERROR")
        print("="*50)
        return False
        
    finally:
        print("\n🔒 Cerrando navegador...")
        driver.quit()


# ============================================
# test_contact_notification.py - NUEVO
# ============================================
def test_contact_notification():
    """Test para verificar notificaciones de nuevos contactos"""
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()))
    
    try:
        print("\n" + "="*50)
        print("🧪 TEST: NOTIFICACIÓN DE CONTACTO")
        print("="*50)
        
        # Login como admin
        print("\n🔑 Haciendo login como admin...")
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
        
        # Ir a contactos
        print("\n📍 Navegando a Contactos...")
        driver.get("http://localhost:5173/dashboard/contacts")
        time.sleep(3)
        
        # Contar contactos iniciales
        try:
            initial_rows = driver.find_elements(By.CSS_SELECTOR, "table tbody tr, .ant-table-tbody tr")
            initial_count = len(initial_rows)
            print(f"📊 Contactos iniciales: {initial_count}")
        except:
            initial_count = 0
            print("📊 No se pudieron contar contactos iniciales")
        
        # Abrir nueva pestaña para crear contacto público
        print("\n🆕 Abriendo nueva pestaña para formulario público...")
        driver.execute_script("window.open('');")
        driver.switch_to.window(driver.window_handles[1])
        
        # Ir a formulario de contacto público
        driver.get("http://localhost:5173/contacto")
        time.sleep(2)
        
        # Llenar formulario de contacto
        print("\n✍️  Llenando formulario de contacto...")
        
        timestamp = int(time.time())
        contact_data = {
            "nombre": "Test",
            "apellido": "Selenium",
            "correo": f"test{timestamp}@test.com",
            "numero": "5555-9999",
            "descripcion": "Test automático de Selenium"
        }
        
        for field_name, field_value in contact_data.items():
            try:
                field = wait.until(EC.presence_of_element_located((By.NAME, field_name)))
                field.clear()
                field.send_keys(field_value)
                print(f"   ✅ {field_name}: {field_value}")
            except Exception as e:
                print(f"   ⚠️  No se encontró campo {field_name}: {e}")
        
        time.sleep(1)
        
        # Enviar formulario
        print("\n📤 Enviando formulario de contacto...")
        try:
            submit_button = wait.until(EC.element_to_be_clickable(
                (By.XPATH, "//button[@type='submit' or contains(text(), 'Enviar') or contains(text(), 'Contactar')]")
            ))
            submit_button.click()
            print("✅ Formulario enviado")
            time.sleep(3)
        except Exception as e:
            print(f"❌ No se pudo enviar: {e}")
            driver.save_screenshot("contact_no_submit.png")
            return False
        
        # Volver a pestaña de admin
        print("\n🔄 Volviendo a pestaña de admin...")
        driver.switch_to.window(driver.window_handles[0])
        
        # Esperar 1 minuto para el polling
        print("\n⏳ Esperando 65 segundos para que el polling detecte el nuevo contacto...")
        for i in range(13):
            time.sleep(5)
            print(f"   ⏱️  {(i+1)*5} segundos...")
        
        # Refrescar la página
        print("\n🔄 Refrescando página de contactos...")
        driver.refresh()
        time.sleep(3)
        
        # Contar contactos finales
        try:
            final_rows = driver.find_elements(By.CSS_SELECTOR, "table tbody tr, .ant-table-tbody tr")
            final_count = len(final_rows)
            print(f"📊 Contactos finales: {final_count}")
        except:
            final_count = 0
            print("📊 No se pudieron contar contactos finales")
        
        # Verificar que aumentó el contador
        if final_count > initial_count:
            print(f"✅ ÉXITO: Nuevo contacto detectado ({initial_count} → {final_count})")
            
            # Buscar el contacto específico
            page_text = driver.page_source
            if contact_data["correo"] in page_text:
                print(f"✅ ÉXITO: Contacto '{contact_data['correo']}' encontrado en la lista")
            
            driver.save_screenshot("contact_notification_success.png")
            print("📸 Screenshot: 'contact_notification_success.png'")
            
            print("\n" + "="*50)
            print("✅ TEST NOTIFICACIÓN CONTACTO: PASÓ")
            print("="*50)
            return True
        else:
            print(f"⚠️  ADVERTENCIA: No se detectó cambio en el contador ({initial_count} → {final_count})")
            driver.save_screenshot("contact_notification_warning.png")
            
            print("\n" + "="*50)
            print("⚠️  TEST NOTIFICACIÓN CONTACTO: ADVERTENCIA")
            print("="*50)
            return False
        
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        driver.save_screenshot("contact_notification_error.png")
        print("\n" + "="*50)
        print("❌ TEST NOTIFICACIÓN CONTACTO: ERROR")
        print("="*50)
        return False
        
    finally:
        print("\n🔒 Cerrando navegador...")
        driver.quit()


# ============================================
# RUN ALL ADDITIONAL TESTS
# ============================================
if __name__ == "__main__":
    print("\n" + "🧪"*25)
    print("TESTS ADICIONALES - Funcionalidades Específicas")
    print("🧪"*25)
    
    results = {}
    
    # Ejecutar tests adicionales
    results['Crear Mascota'] = test_create_pet()
    time.sleep(2)
    
    results['Crear Cita'] = test_create_appointment()
    time.sleep(2)
    
    results['Crear Producto'] = test_create_product()
    time.sleep(2)
    
    results['Notificación Contacto'] = test_contact_notification()
    
    # Resumen
    print("\n" + "="*60)
    print("📊 RESUMEN DE TESTS ADICIONALES")
    print("="*60)
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    for test_name, result in results.items():
        status = "✅ PASÓ" if result else "❌ FALLÓ"
        print(f"{status} - {test_name}")
    
    print("\n" + "-"*60)
    print(f"Total: {passed}/{total} tests pasaron")
    print(f"Porcentaje: {(passed/total)*100:.1f}%")
    print("="*60)
    
    if passed == total:
        print("\n🎉 ¡TODOS LOS TESTS ADICIONALES PASARON!")
    elif passed >= total/2:
        print("\n⚠️  La mayoría de tests pasó")
    else:
        print("\n❌ Varios tests fallaron")
    
    print("\n✅ Tests adicionales completados")