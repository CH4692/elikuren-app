from enum import Enum


class Role(str, Enum):
    VORSTAND = "vorstand"
    MITGLIED = "mitglied"
    KASSENWART = "kassenwart"
    KASSENPRUEFER = "kassenpruefer"
