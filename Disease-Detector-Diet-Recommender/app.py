import webbrowser
from threading import Timer


import warnings
warnings.filterwarnings("ignore")



from flask import Flask, render_template, request, redirect, url_for, session, flash
from flask_mysqldb import MySQL
from flask_cors import CORS
import MySQLdb

app = Flask(__name__)
app.secret_key = "your_secret_key"

# MySQL config
app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = 'Your SQL password here'
app.config['MYSQL_DB'] = 'flask_login'
app.config['MYSQL_PORT'] = 3306
app.config['MYSQL_CURSORCLASS'] = 'DictCursor'

mysql = MySQL(app)
CORS(app)  # Enable CORS for all routes

# Connection test function - will be called on startup
def test_mysql_connection():
    """Test MySQL connection on startup"""
    try:
        from MySQLdb.cursors import DictCursor
        conn = MySQLdb.connect(
            host=app.config.get('MYSQL_HOST'),
            user=app.config.get('MYSQL_USER'),
            passwd=app.config.get('MYSQL_PASSWORD'),
            db=app.config.get('MYSQL_DB'),
            port=app.config.get('MYSQL_PORT', 3306),
            cursorclass=DictCursor
        )
        cur = conn.cursor()
        cur.execute("SELECT DATABASE();")
        cur.fetchone()
        cur.close()
        conn.close()
        print("✅ Connected to db")
        return True
    except Exception as e:
        print(f"⚠️  Could not test database connection: {e}")
        print("   Connection will be established on first database request.")
        return False

# -----------------------------
# Disease Detection Model Setup
# ------------------------


# Home page
@app.route("/")
def index():
    return render_template("index.html", username=session.get("username"))


# Login page
@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form.get("username")
        password = request.form.get("password")

        try:
            # Get connection within request context
            # Flask-MySQLdb automatically manages connections
            conn = mysql.connection
            if conn is None:
                # Fallback: try direct MySQLdb connection
                from MySQLdb.cursors import DictCursor
                conn = MySQLdb.connect(
                    host=app.config.get('MYSQL_HOST'),
                    user=app.config.get('MYSQL_USER'),
                    passwd=app.config.get('MYSQL_PASSWORD'),
                    db=app.config.get('MYSQL_DB'),
                    port=app.config.get('MYSQL_PORT', 3306),
                    cursorclass=DictCursor
                )
            
            cur = conn.cursor()
            cur.execute(
                "SELECT * FROM users WHERE username=%s AND password=%s",
                (username, password),
            )
            account = cur.fetchone()
            cur.close()
            
            # Close connection if it was a direct connection (fallback)
            if mysql.connection is None:
                conn.close()

            if account:
                session["loggedin"] = True
                session["id"] = account["id"]
                session["username"] = account["username"]
                flash("✅ Successfully Logged In!", "success")
                return redirect(url_for("index"))
            else:
                flash("❌ Incorrect username or password!", "error")
                return redirect(url_for("login"))
        except (MySQLdb.Error, MySQLdb.OperationalError, MySQLdb.InterfaceError) as e:
            error_msg = str(e)
            if "Access denied" in error_msg or "1045" in error_msg:
                flash("❌ Database authentication failed! Check username/password.", "error")
            elif "Unknown database" in error_msg or "1049" in error_msg:
                flash("❌ Database 'flask_login' does not exist! Please create it.", "error")
            elif "Can't connect" in error_msg or "2003" in error_msg:
                flash("❌ Cannot connect to MySQL server! Make sure MySQL is running.", "error")
            else:
                flash("❌ Database connection error!", "error")
            return redirect(url_for("login"))
        except Exception as e:
            error_msg = str(e)
            print(f"❌ Error in login: {error_msg}")
            flash("❌ An error occurred. Please try again.", "error")
            return redirect(url_for("login"))

    return render_template("login.html", username=session.get("username"))


# Register page
@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        username = request.form.get("username")
        password = request.form.get("password")

        try:
            # Get connection within request context
            conn = mysql.connection
            if conn is None:
                # Fallback: try direct MySQLdb connection
                from MySQLdb.cursors import DictCursor
                conn = MySQLdb.connect(
                    host=app.config.get('MYSQL_HOST'),
                    user=app.config.get('MYSQL_USER'),
                    passwd=app.config.get('MYSQL_PASSWORD'),
                    db=app.config.get('MYSQL_DB'),
                    port=app.config.get('MYSQL_PORT', 3306),
                    cursorclass=DictCursor
                )
            
            cur = conn.cursor()
            cur.execute(
                "INSERT INTO users (username, password) VALUES (%s, %s)",
                (username, password),
            )
            conn.commit()
            cur.close()
            
            # Close connection if it was a direct connection (fallback)
            if mysql.connection is None:
                conn.close()
            
            flash("🎉 Successfully Signed Up!", "success")
            return redirect(url_for("login"))
        except (MySQLdb.Error, MySQLdb.OperationalError, MySQLdb.InterfaceError) as e:
            error_msg = str(e)
            if "Duplicate entry" in error_msg or "UNIQUE constraint" in error_msg:
                flash("⚠️ Username already exists!", "error")
            elif "Access denied" in error_msg or "1045" in error_msg:
                flash("❌ Database authentication failed! Check username/password.", "error")
            elif "Unknown database" in error_msg or "1049" in error_msg:
                flash("❌ Database 'flask_login' does not exist! Please create it.", "error")
            elif "Can't connect" in error_msg or "2003" in error_msg:
                flash("❌ Cannot connect to MySQL server! Make sure MySQL is running.", "error")
            else:
                flash("❌ Database connection error!", "error")
            return redirect(url_for("register"))
        except Exception as e:
            error_msg = str(e)
            print(f"❌ Error in register: {error_msg}")
            flash("❌ An error occurred. Please try again.", "error")
            return redirect(url_for("register"))

    return render_template("register.html", username=session.get("username"))


# Logout
@app.route("/logout")
def logout():
    session.clear()
    flash("👋 You have been logged out.", "info")
    return redirect(url_for("login"))
# Explore page
@app.route("/explore")
def explore():
    return render_template("explore.html", username=session.get("username"))

# Disease Detection page
@app.route("/diseasedetection")
def diseasedetection():
    return render_template("diseasedetection.html", username=session.get("username"))

# Diet Recommendation page
@app.route("/dietrecommendation")
def dietrecommendation():
    return render_template("dietrecommendation.html", username=session.get("username"))


# Auto open browser
def open_browser():
    webbrowser.open_new("http://127.0.0.1:5000/")


if __name__ == "__main__":
    # Test database connection on startup
    test_mysql_connection()
    Timer(1, open_browser).start()
    app.run(debug=False, port=5000)
