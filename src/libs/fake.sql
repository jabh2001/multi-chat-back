insert into label(name, description)
values
('Trabajo', 'Etiqueta para trabajos'),
('Consulta', 'Etiqueta para Consultas'),
('Juego', 'Etiqueta para Juegos');

insert into team(name, description)
values
('Desarrollo', 'Equipo de trabajo para Desarrollo'),
('Testeo', 'Equipo de trabajo para Testeo'),
('Implementacion', 'Equipo de trabajo para Implementacion');

INSERT INTO contact (name, email, "phoneNumber", "avatarUrl") VALUES
    ('Juan Pérez', 'juan@example.com', '+1234567890', 'https://example.com/avatar1.jpg'),
    ('María López', 'maria@example.com', '+9876543210', 'https://example.com/avatar2.jpg'),
    ('Carlos García', 'carlos@example.com', '+1112223333', 'https://example.com/avatar3.jpg');

INSERT INTO "user" (name, email, role) VALUES
    ('Juan Pérez', 'juan@example.com', 'admin'),
    ('María López', 'maria@example.com', 'agent'),
    ('Pedro Rodriguez', 'pedro@example.com', 'agent');

insert into public.contact_label("contactId", "labelId") values (1, 2), (1, 3), (2, 2), (2, 3), (3, 1), (3, 3) returning *;
insert into public.user_team("userId", "teamId") values (1, 2), (1, 3), (2, 2), (2, 3), (3, 1), (3, 3) returning *;

insert into social_media("contactId", name, url, "displayText") values 
(1, 'facebook', 'facebook.com/123', '123'),
(1, 'instagram', 'instagram.com/123', '@123'),
(2, 'threads', 'threads.com/456', '456'),
(2, 'facebook', 'facebook.com/456', '456');