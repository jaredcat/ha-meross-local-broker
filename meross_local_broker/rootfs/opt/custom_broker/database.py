import os

from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import scoped_session, sessionmaker

from constants import _DB_PATH

dbpath = os.environ.get("DB_PATH")
if dbpath is None:
    dbpath = _DB_PATH

dbpath = f'sqlite:///{dbpath}'

engine = create_engine(dbpath, convert_unicode=True)
db_session = scoped_session(sessionmaker(autocommit=False,
                                         autoflush=False,
                                         bind=engine))
Base = declarative_base()
Base.query = db_session.query_property()


def add_password_upgraded_column():
    engine.execute(text('ALTER TABLE users ADD password_upgraded Boolean DEFAULT 1'))
    engine.execute(text('UPDATE users SET password_upgraded=0'))


def init_db():
    # import all modules here that might define models so that
    # they will be registered properly on the metadata.  Otherwise
    # you will have to import them first before calling init_db()
    Base.metadata.create_all(bind=engine)

    # Upgrade process.
    # Add the user.password_upgraded column
    results = engine.execute(text('SELECT * FROM pragma_table_info("users") WHERE name = "password_upgraded"'))
    if len(list(results))==0:
        add_password_upgraded_column()
