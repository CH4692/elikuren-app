"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signOut } from "next-auth/react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { UserResponse } from "@/lib/api";

type ProfileFormProps = {
  initialUser: UserResponse;
};

type FormValues = {
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  street: string;
  house_number: string;
  postal_code: string;
  location: string;
  birthday: string;
};

function valuesFromUser(user: UserResponse): FormValues {
  return {
    firstname: user.firstname ?? "",
    lastname: user.lastname ?? "",
    email: user.email ?? "",
    phone: user.phone ?? "",
    street: user.street ?? "",
    house_number: user.house_number ?? "",
    postal_code: user.postal_code ?? "",
    location: user.location ?? "",
    birthday: user.birthday ?? "",
  };
}

function valuesEqual(a: FormValues, b: FormValues) {
  return (Object.keys(a) as (keyof FormValues)[]).every((k) => a[k] === b[k]);
}

export function ProfileForm({ initialUser }: ProfileFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState(initialUser);
  const [values, setValues] = useState<FormValues>(() =>
    valuesFromUser(initialUser),
  );
  const savedRef = useRef(valuesFromUser(initialUser));
  const [saving, setSaving] = useState(false);

  const dirty = !valuesEqual(values, savedRef.current);

  useEffect(() => {
    function onBeforeUnload(event: BeforeUnloadEvent) {
      if (!dirty) return;
      event.preventDefault();
      event.returnValue = "";
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  const updateField = useCallback(
    (field: keyof FormValues, value: string) => {
      setValues((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  return (
    <form
      className="space-y-5"
      onSubmit={async (event) => {
        event.preventDefault();
        setSaving(true);
        try {
          const res = await fetch("/api/me", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              firstname: values.firstname,
              lastname: values.lastname,
              email: values.email,
              phone: values.phone,
              street: values.street,
              house_number: values.house_number,
              postal_code: values.postal_code,
              location: values.location,
              birthday: values.birthday || null,
            }),
          });
          if (!res.ok) {
            toast.error("Profil konnte nicht gespeichert werden");
            return;
          }
          const updated = (await res.json()) as UserResponse;
          setUser(updated);
          const next = valuesFromUser(updated);
          setValues(next);
          savedRef.current = next;
          toast.success("Profil gespeichert");
          const from = searchParams.get("from");
          router.push(from && from.startsWith("/") ? from : "/dashboard");
        } finally {
          setSaving(false);
        }
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="firstname">Vorname</Label>
          <Input
            id="firstname"
            name="firstname"
            value={values.firstname}
            onChange={(e) => updateField("firstname", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="lastname">Nachname</Label>
          <Input
            id="lastname"
            name="lastname"
            value={values.lastname}
            onChange={(e) => updateField("lastname", e.target.value)}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="email">E-Mail</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={values.email}
          onChange={(e) => updateField("email", e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="phone">Telefon</Label>
        <Input
          id="phone"
          name="phone"
          value={values.phone}
          onChange={(e) => updateField("phone", e.target.value)}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-[1fr_8rem]">
        <div>
          <Label htmlFor="street">Straße</Label>
          <Input
            id="street"
            name="street"
            value={values.street}
            onChange={(e) => updateField("street", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="house_number">Nr.</Label>
          <Input
            id="house_number"
            name="house_number"
            value={values.house_number}
            onChange={(e) => updateField("house_number", e.target.value)}
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-[8rem_1fr]">
        <div>
          <Label htmlFor="postal_code">PLZ</Label>
          <Input
            id="postal_code"
            name="postal_code"
            value={values.postal_code}
            onChange={(e) => updateField("postal_code", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="location">Ort</Label>
          <Input
            id="location"
            name="location"
            value={values.location}
            onChange={(e) => updateField("location", e.target.value)}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="birthday">Geburtstag</Label>
        <Input
          id="birthday"
          name="birthday"
          type="date"
          value={values.birthday}
          onChange={(e) => updateField("birthday", e.target.value)}
        />
      </div>
      {user.voice ? (
        <div className="text-sm text-[#5c574e]">
          Stimmgruppe: <span className="text-[#1f1f23]">{user.voice}</span>
        </div>
      ) : null}
      <div className="flex items-center gap-2 text-sm text-[#5c574e]">
        <span>Rolle:</span>
        <Badge variant="default">{user.role}</Badge>
      </div>
      <div className="flex flex-wrap gap-3 pt-2">
        <Button type="submit" size="lg" disabled={saving || !dirty}>
          {saving ? "Speichert…" : "Profil speichern"}
        </Button>
        <Button
          type="button"
          size="lg"
          variant="outline"
          className="border-[#cfc8bb] bg-transparent text-[#1f1f23] hover:bg-[#efe9df]"
          onClick={() => signOut({ callbackUrl: "/home" })}
        >
          Abmelden
        </Button>
      </div>
    </form>
  );
}
