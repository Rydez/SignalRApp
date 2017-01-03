

using MySql.Data.MySqlClient;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Web;

namespace SignalRApp.Server
{
    // Hashing method by user named "csharptest.net"
    // http://stackoverflow.com/questions/4181198/how-to-hash-a-password

    public class AccountManager
    {

        //TODO: Put initial gold, health, mana, etc. into some constants file
        private int gold = 10;
        private int health = 10;
        private int mana = 10;
        private int level = 1;

        public string Login(string name, string password)
        {
            string connString = System.Configuration.ConfigurationManager.ConnectionStrings["WebAppConnString"].ToString();
            MySqlConnection conn = new MySqlConnection(connString);


            string passwordHash = "";
            try
            {
                conn.Open();
                string cmdText = "SELECT password FROM user WHERE name = @name";
                MySqlCommand cmd = new MySqlCommand(cmdText, conn);
                cmd.Parameters.AddWithValue("@name", name);

                MySqlDataReader passwordReader = cmd.ExecuteReader();
                while (passwordReader.Read())
                {
                    passwordHash = passwordReader.GetString(0);
                }
                cmd.Dispose();
                conn.Close();
            }
            catch (MySqlException exception)
            {
                throw exception;
            }


            byte[] hashBytes = Convert.FromBase64String(passwordHash);

            byte[] salt = new byte[16];
            Array.Copy(hashBytes, 0, salt, 0, 16);

            var pbkdf2 = new Rfc2898DeriveBytes(password, salt, 10000);
            byte[] hash = pbkdf2.GetBytes(20);

            for (int i = 0; i < 20; i++)
            {
                if (hashBytes[i + 16] != hash[i])
                {
                    return "fail";
                }
            }

            return "success";
        }

        public string Register(string name, string password)
        {

            byte[] salt;
            new RNGCryptoServiceProvider().GetBytes(salt = new byte[16]);

            var pbkdf2 = new Rfc2898DeriveBytes(password, salt, 10000);
            byte[] hash = pbkdf2.GetBytes(20);

            byte[] hashBytes = new byte[36];
            Array.Copy(salt, 0, hashBytes, 0, 16);
            Array.Copy(hash, 0, hashBytes, 16, 20);

            string passwordHash = Convert.ToBase64String(hashBytes);

            string connString = System.Configuration.ConfigurationManager.ConnectionStrings["WebAppConnString"].ToString();
            MySqlConnection conn = new MySqlConnection(connString);

            try
            {
                conn.Open();
                string cmdText = "INSERT INTO user (name, password, gold, health, mana, level) VALUES (@name, @password, @gold, @health, @mana, @level)";
                MySqlCommand cmd = new MySqlCommand(cmdText, conn);
                cmd.Parameters.AddWithValue("@name", name);
                cmd.Parameters.AddWithValue("@password", passwordHash);
                cmd.Parameters.AddWithValue("@gold", gold);
                cmd.Parameters.AddWithValue("@health", health);
                cmd.Parameters.AddWithValue("@mana", mana);
                cmd.Parameters.AddWithValue("@level", level);

                cmd.ExecuteNonQuery();
                cmd.Dispose();
                conn.Close();

                return "success";
            }
            catch(MySqlException exception)
            {
                throw exception;
            }
        }
    }
}