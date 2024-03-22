drop database "multi-chat";
create database "multi-chat";
\c "multi-chat";

insert into label(name, description) values
('Trabajo', 'Etiqueta para trabajos'),
('Consulta', 'Etiqueta para Consultas'),
('Juego', 'Etiqueta para Juegos');

insert into team(name, description) values
('Desarrollo', 'Equipo de trabajo para Desarrollo'),
('Testeo', 'Equipo de trabajo para Testeo'),
('Implementacion', 'Equipo de trabajo para Implementacion');

INSERT INTO contact (name, email, "phoneNumber", "avatarUrl") VALUES
    ('Jhonder', 'jabh@gmail.com', '+584123754917', 'https://example.com/avatar1.jpg'),
    ('Vero', 'vero@gmail.com', '+573025880823', 'https://example.com/avatar2.jpg');


insert into social_media("contactId", name, url, "displayText") values 
(1, 'facebook', 'facebook.com/123', '123'),
(1, 'instagram', 'instagram.com/123', '@123'),
(2, 'threads', 'threads.com/456', '456'),
(2, 'facebook', 'facebook.com/456', '456');

insert into public.inbox("name", "channelType") values ('rojo', 'whatsapp'), ('azul', 'whatsapp');
insert into public.conversation( "inboxId", "senderId", "assignedUserId", "assignedTeamId" ) values 
(1, 1, 1, null), 
(1, 2, 1, null), 
(2, 1, null, 1),
(2, 2, null, 1);