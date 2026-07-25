def test_health(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"
    assert "X-Request-ID" in response.headers


def test_users_me_requires_auth(client):
    response = client.get("/api/v1/users/me")
    assert response.status_code == 401
    body = response.json()
    assert body["code"] == "http_401"
    assert "request_id" in body
