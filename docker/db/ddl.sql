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

CREATE TABLE photo (
  id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
  data BLOB NOT NULL,
  created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
 );

CREATE TABLE accountInPhoto (
  accountId INT,
  photoId INT,
  PRIMARY KEY (accountId, photoId),
  constraint cnfk_accountInPhoto_account foreign key (accountId) references account (id),
  constraint cnfk_accountInPhoto_photo foreign key (photoId) references photo (id)
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
-- passwordHash using bcrypt with 10 salt rounds
create procedure createAdminAccount(IN in_password VARCHAR(512))
begin
    INSERT INTO account (username, name, passwordHash, role)
    VALUE ('admin', 'Administrator', in_password, 'ADMIN');
end;$$
DELIMITER ;


DELIMITER $$
CREATE PROCEDURE registerAccount(in in_code varchar(50), in in_username varchar(50), in in_name varchar(100), in in_passwordHash varchar(512))
BEGIN
	DECLARE count_regkey INTEGER;
  DECLARE count_users INTEGER;
  DECLARE decl_regInviteId INTEGER;
  DECLARE decl_userId INTEGER;
  SELECT COUNT(*) INTO count_users FROM account WHERE username=in_username;

	IF count_users = 0 THEN
		SELECT COUNT(*) INTO count_regkey FROM registrationInvitation WHERE code=in_code AND accepted=0;
		IF count_regkey != 0 THEN
			INSERT INTO account(username, name, passwordHash) VALUES (in_username, in_name, in_passwordHash);
			SELECT id INTO decl_userId FROM account WHERE username=in_username;
			SELECT MIN(id) INTO decl_regInviteId FROM registrationInvitation WHERE code=in_code AND accepted=0;
      UPDATE registrationInvitation SET accepted=1, accountId=decl_userId WHERE id=decl_regInviteId;
      SELECT 'done' AS 'output' FROM DUAL;
    ELSE
			SELECT 'unknown-code' AS 'output' FROM DUAL;
    END IF;
  ELSE
    SELECT 'user-exists' AS 'output' FROM DUAL;
  END IF;
END;
$$ DELIMITER ;


DELIMITER $$
CREATE PROCEDURE `acceptChannelInvitation`(IN in_channelId INT, IN in_accountId INT)
BEGIN
  DECLARE count_invitations INT;
  DECLARE count_accountInChannel INT;
  DECLARE decl_invId INT;

  SELECT COUNT(*) INTO count_invitations FROM channelInvitation WHERE channelId=in_channelId AND accountId=in_accountId AND accepted=0;
	SELECT COUNT(*) INTO count_accountInChannel FROM accountInChannel WHERE channelId=in_channelId AND accountId=in_accountId;

  IF count_invitations != 0 AND count_accountInChannel = 0 THEN
	  SELECT MIN(id) INTO decl_invId FROM channelInvitation WHERE channelId=in_channelId AND accountId=in_accountId AND accepted=0;
	  UPDATE channelInvitation SET accepted=1 WHERE id=decl_invId;
	  INSERT INTO accountInChannel(channelId, accountId) VALUE (in_channelId, in_accountId);
	  SELECT 'done' AS 'output' FROM DUAL;
	ELSE
	  SELECT 'not-found' AS 'output' FROM DUAL;
  END IF;
END
$$ DELIMITER ;


DELIMITER $$
CREATE PROCEDURE insertMessage(IN in_channelId INT, IN in_threadId INT, IN in_creatorId INT, IN in_content VARCHAR(2048))
BEGIN
IF in_threadId IS NULL THEN
	INSERT INTO thread (channelId) VALUE (in_channelId);
	INSERT INTO message(threadId, creatorId, content) VALUE (last_insert_id(), in_creatorId, in_content);
	SELECT m.id AS messageId, m.threadId, m.created, m.content, a.id AS accountId, a.name, a.username FROM message m JOIN account a ON m.creatorId=a.id WHERE m.id=last_insert_id();
ELSE
	INSERT INTO message(threadId, creatorId, content) VALUE (in_threadId, in_creatorId, in_content);
	SELECT m.id AS messageId, m.threadId, m.created, m.content, a.id AS accountId, a.name, a.username FROM message m JOIN account a ON m.creatorId=a.id WHERE m.id=last_insert_id();
END IF;
END;
$$ DELIMITER ;


DELIMITER $$
CREATE PROCEDURE addAccountPhoto (in_account INT, IN in_photo BLOB)
BEGIN
	DECLARE photoExists INT;
  DECLARE userHasPhoto INT;
  DECLARE photoId INT;

	SELECT COUNT(*) INTO photoExists FROM photo WHERE data=in_photo;
  SELECT COUNT(*) INTO userHasPhoto FROM accountInPhoto WHERE accountId=in_account;

  IF photoExists = 0 THEN
		INSERT INTO photo (data) VALUE (in_photo);
    SELECT last_insert_id() INTO photoId;
	ELSE
		SELECT id INTO photoId FROM photo WHERE data=in_photo;
	END IF;

	IF userHasPhoto = 0 THEN
		INSERT INTO accountInPhoto (accountId, photoId) VALUE (in_account, photoId);
	ELSE
		UPDATE accountInPhoto SET photoId=photoId WHERE accountId=in_account;
  END IF;
END;
$$ DELIMITER ;



-- FUNCTIONS

DELIMITER $$
CREATE FUNCTION isInChannel (in_account INT, in_channel INT)
	RETURNS BOOLEAN
	READS SQL DATA
	DETERMINISTIC
    BEGIN
		DECLARE isInChannelDecl INT;
        SELECT count(*) INTO isInChannelDecl FROM accountInChannel WHERE accountId=in_account AND channelId=in_channel;

        IF isInChannelDecl = 0 THEN
			RETURN false;
		ELSE
            RETURN true;
        END IF;
    END;
$$ DELIMITER ;


DELIMITER $$
CREATE FUNCTION isInThread (in_account INT, in_thread INT)
	RETURNS BOOLEAN
	READS SQL DATA
	DETERMINISTIC
    BEGIN
		DECLARE isInThreadDecl INT;
		SELECT COUNT(*) INTO isInThreadDecl FROM accountInChannel aic JOIN thread t ON aic.channelId=t.channelId WHERE t.id=in_thread AND aic.accountId=in_account;
        IF isInThreadDecl != 0 THEN
			RETURN true;
		ELSE
            RETURN false;
		END IF;
    END;
$$ DELIMITER ;


--DELIMITER $$
--CREATE FUNCTION isInThreadOrChannel (in_account INT, in_channel INT, in_thread INT)
--	RETURNS INT
--	READS SQL DATA
--	DETERMINISTIC
--    BEGIN
--		DECLARE output INT;
--		IF in_thread IS NULL THEN
--			SELECT COUNT(*) INTO output FROM accountInChannel WHERE accountId=in_account AND channelId=in_channel AND accountId=in_account;
--            RETURN output;
--		ELSE
--			SELECT COUNT(*) INTO output FROM accountInChannel aic JOIN thread t ON aic.channelId=t.channelId WHERE t.id=in_thread AND aic.accountId=in_account;
--            RETURN output;
--	    END IF;
--    END;
--$$ DELIMITER ;


-- VIEWS
CREATE VIEW allAccounts AS
SELECT id, name, username, role FROM account;
