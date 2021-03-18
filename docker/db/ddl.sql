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
    role VARCHAR(50) NOT NULL DEFAULT 'USER',
    constraint cnfk_account_code foreign key (role) REFERENCES role (code)
);

CREATE TABLE channel (
    id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    description VARCHAR(512),
    type VARCHAR(50) not null,
    constraint cnfk_channel_channelType foreign key (type) references channelType (code)
);

CREATE TABLE accountInChannel (
    channelId INT NOT NULL,
    accountId INT NOT NULL,
    PRIMARY KEY (channelId, accountId),
    constraint cnfk_accountInChannel_account foreign key (accountId) references account (id),
    constraint cnfk_accountInChannel_channel foreign key (channelId) references channel (id)
);

CREATE TABLE registrationInvitation (
    id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    code VARCHAR(50) NOT NULL,
    accountId INT,
    accepted BOOLEAN NOT NULL DEFAULT FALSE,
    constraint cnfk_registrationInvitation_account foreign key (accountId) REFERENCES account (id)
);

CREATE TABLE channelInvitation (
    id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    channelId INT NOT NULL,
    accountId INT NOT NULL,
    accepted BOOLEAN NOT NULL DEFAULT FALSE,
    constraint cnfk_channelInvitation_channel foreign key (channelId) REFERENCES channel (id),
    constraint cnfk_channelInvitation_account foreign key (accountId) REFERENCES account (id)
);

CREATE TABLE thread (
    id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    channelId INT NOT NULL,
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    constraint cnfk_thread_channel foreign key (channelId) references channel (id)
);

CREATE TABLE message (
    id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    threadId INT NOT NULL,
    creatorId INT NOT NULL,
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    content VARCHAR(2048) NOT NULL,
    constraint cnfk_message_thread foreign key (threadId) references thread (id),
    constraint cnfk_message_creator foreign key (creatorId) references account (id)
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
