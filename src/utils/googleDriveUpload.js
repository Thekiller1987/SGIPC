import { gapi } from "gapi-script";

const CLIENT_ID = "893767644955-smtsidj7upr0sdic3k4ghi66e7r1u5ic.apps.googleusercontent.com";
const SCOPES = "https://www.googleapis.com/auth/drive.file";

export const iniciarGapi = () => {
  return new Promise((resolve, reject) => {
    gapi.load("client:auth2", () => {
      gapi.auth2
        .init({
          client_id: CLIENT_ID,
          scope: SCOPES,
        })
        .then(() => resolve())
        .catch((err) => {
          console.error("Error al inicializar gapi.auth2:", err);
          reject(err);
        });
    });
  });
};

export const subirArchivoADrive = async (blob, nombreArchivo) => {
  const auth = gapi.auth2.getAuthInstance();
  if (!auth.isSignedIn.get()) {
    await auth.signIn();
  }

  const accessToken = gapi.auth.getToken().access_token;

  const metadata = {
    name: nombreArchivo,
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  };

  const form = new FormData();
  form.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
  form.append("file", blob);

  const response = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: form,
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Error al subir archivo:", errorText);
    throw new Error("Falló la subida del archivo a Google Drive");
  }

  const data = await response.json();
  const fileId = data.id;

  // Hacer público el archivo
  await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ role: "reader", type: "anyone" }),
  });

  return `https://drive.google.com/file/d/${fileId}/view`;
};
