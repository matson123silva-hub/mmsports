// catalogo-service.js
// Funções para gerenciar o catálogo de camisas no Firestore + Storage
// Substitui as chamadas que antes iam pro Supabase

import {
  db,
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
} from "./firebase-config.js";

const CAMISAS_COLLECTION = "camisas";

// Preencha depois de criar a conta grátis em cloudinary.com
const CLOUDINARY_CLOUD_NAME = "SEU_CLOUD_NAME";
const CLOUDINARY_UPLOAD_PRESET = "SEU_UPLOAD_PRESET";

/**
 * Busca todas as camisas do catálogo.
 * Use isso no lugar da antiga consulta ao Supabase pra popular a vitrine.
 */
export async function buscarCamisas() {
  const snapshot = await getDocs(collection(db, CAMISAS_COLLECTION));
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Sobe uma foto pro Cloudinary e retorna a URL pública.
 * @param {File} arquivo - arquivo de imagem selecionado no input
 */
export async function subirFoto(arquivo) {
  const formData = new FormData();
  formData.append("file", arquivo);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  const resposta = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: "POST", body: formData }
  );
  const dados = await resposta.json();
  return dados.secure_url;
}

/**
 * Adiciona uma nova camisa ao catálogo.
 * @param {Object} camisa - { time, liga, modelo, genero, precoVista, precoParcelado, tamanhos, fotoUrl, destaque }
 */
export async function adicionarCamisa(camisa) {
  const id = camisa.id || crypto.randomUUID();
  await setDoc(doc(db, CAMISAS_COLLECTION, id), {
    ...camisa,
    destaque: camisa.destaque || false,
    criadoEm: new Date().toISOString(),
  });
  return id;
}

/**
 * Edita campos de uma camisa existente (preço, tamanhos, etc.)
 */
export async function editarCamisa(id, camposAtualizados) {
  await updateDoc(doc(db, CAMISAS_COLLECTION, id), camposAtualizados);
}

/**
 * Remove uma camisa do catálogo.
 */
export async function removerCamisa(id) {
  await deleteDoc(doc(db, CAMISAS_COLLECTION, id));
}

/**
 * Liga/desliga a estrela (destaque) de uma camisa.
 * Resolve o bug do "estrela não salvando" — agora persiste no Firestore.
 */
export async function alternarDestaque(id, valorAtual) {
  await updateDoc(doc(db, CAMISAS_COLLECTION, id), {
    destaque: !valorAtual,
  });
}
