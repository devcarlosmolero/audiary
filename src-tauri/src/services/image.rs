use base64::{engine::general_purpose, Engine as _};
use image::io::Reader as ImageReader;
use std::io::Cursor;

#[tauri::command]
pub async fn convert_image_to_base64(path: &str) -> Result<String, String> {
    let img = ImageReader::open(path)
        .map_err(|e| format!("Failed to open image: {}", e))?
        .decode()
        .map_err(|e| format!("Failed to decode image: {}", e))?;
    
    let mut bytes = Vec::new();
    {
        let mut cursor = Cursor::new(&mut bytes);
        img.write_to(&mut cursor, image::ImageOutputFormat::Jpeg(90))
            .map_err(|e| format!("Failed to encode image: {}", e))?;
    };
    
    let base64 = general_purpose::STANDARD.encode(&bytes);
    let mime_type = "image/jpeg";
    
    Ok(format!("data:{};base64,{}", mime_type, base64))
}