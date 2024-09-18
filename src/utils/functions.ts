export function getAge(birthday: string) {
  return new Date().getFullYear() - new Date(birthday).getFullYear()
}
