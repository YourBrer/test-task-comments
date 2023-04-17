export type Author = {
  avatar: string,
  id: number,
  name: string,
}

export type CommentType = {
  author: Author,
  created: string,
  id: number,
  likes: number,
  parent: number|null,
  childs?: CommentType[],
  text: string,
}
