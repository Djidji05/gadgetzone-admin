UPDATE stores 
SET user_id = 2,
    settings = settings || '{"identityData": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="}'::json
WHERE name = 'bouttech';

SELECT id, name, user_id, settings FROM stores WHERE name = 'bouttech';
