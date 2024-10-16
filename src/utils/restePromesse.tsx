function restePromesse({
  objectif,
  promesses,
}: {
  objectif: number;
  promesses: number;
}) {
  return objectif > promesses ? objectif - promesses : 0;
}

export default restePromesse;
