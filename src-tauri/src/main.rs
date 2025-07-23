#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;
use std::fs;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn save_data(app_handle: tauri::AppHandle, key: String, value: String) -> Result<(), String> {
    let app_dir = app_handle.path().app_data_dir().map_err(|e| e.to_string())?;
    
    // 确保目录存在
    fs::create_dir_all(&app_dir).map_err(|e| e.to_string())?;
    
    let file_path = app_dir.join(format!("{}.json", key));
    fs::write(file_path, value).map_err(|e| e.to_string())?;
    
    Ok(())
}

#[tauri::command]
fn load_data(app_handle: tauri::AppHandle, key: String) -> Result<String, String> {
    let app_dir = app_handle.path().app_data_dir().map_err(|e| e.to_string())?;
    let file_path = app_dir.join(format!("{}.json", key));
    
    if file_path.exists() {
        fs::read_to_string(file_path).map_err(|e| e.to_string())
    } else {
        Ok(String::new())
    }
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            #[cfg(debug_assertions)]
            {
                let window = app.get_webview_window("main").unwrap();
                window.open_devtools();
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![greet, save_data, load_data])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}