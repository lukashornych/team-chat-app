-- setups DDL for database
CREATE TABLE role (
    code VARCHAR(50) PRIMARY KEY NOT NULL
);

INSERT INTO role (code) VALUES ('USER'), ('MODERATOR'), ('ADMIN');

CREATE TABLE channelType(
    code varchar(50) primary key not null
);

insert into channelType (code) values ('PUBLIC_CHANNEL'), ('PRIVATE_GROUP');

CREATE TABLE account (
    id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    passwordHash VARCHAR(512) NOT NULL,
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    role VARCHAR(50) NOT NULL DEFAULT 'USER' REFERENCES role(code)
);

CREATE TABLE channel (
    id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    description VARCHAR(512),
    type VARCHAR(50) not null references channelType (code)
);

CREATE TABLE accountInChannel (
    channelId INT NOT NULL,
    accountId INT NOT NULL,
    PRIMARY KEY (channelId, accountId)
);

CREATE TABLE registrationInvitation (
    id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    code VARCHAR(50) NOT NULL,
    accountId INT REFERENCES account (id),
    accepted BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE channelInvitation (
    id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    channelId INT NOT NULL REFERENCES channel(id),
    accountId INT NOT NULL REFERENCES account(id),
    accepted BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE thread (
    id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    channelId INT NOT NULL REFERENCES channel(id),
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE message (
    id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    threadId INT NOT NULL REFERENCES thread(id),
    creatorId INT NOT NULL REFERENCES account(id),
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    content VARCHAR(2048) NOT NULL
);




-- TRIGGERS
DELIMITER $$
create trigger acceptRegistrationInvitation
    before update
    on registrationInvitation for each row
begin
    if NEW.accountId is not null then
        SET NEW.accepted = true;
    end if;
end;$$
DELIMITER ;

DELIMITER $$
create trigger acceptChannelInvitation
    before update
    on channelInvitation for each row
begin
    if NEW.accountId is not null then SET NEW.accepted = true;
    end if;
end;$$
DELIMITER ;




-- PROCEDURES
DELIMITER $$
-- passwordHash using bcrypt with 12 salt rounds
create procedure createAdminAccount(in username varchar(50), in `name` varchar(100), in passwordHash varchar(512))
begin
    INSERT INTO account (username, name, passwordHash, role)
    values (username, name, passwordHash, 'ADMIN');
end;$$
DELIMITER ;
