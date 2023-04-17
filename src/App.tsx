import React, {useEffect, useState, useCallback} from "react";
import "./App.css";
import {Author, CommentType} from "./models/models";
import getCommentsRequest from "./api/comments/getCommentsRequest";
import getAuthorsRequest from "./api/authors/getAuthorsRequest";
import {commentsPage1, commentsPage2, commentsPage3} from './data/comments';
import Comment from "./components/Comment";


function App() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [likesCount, setLikesCount] = useState(0);
  const [commentsCount, setCommentsCount] = useState(0);
  const [currentPage, setCurentPage] = useState(1);
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    initialFunc();
  }, []);

  /** Запускается при инициализации приложения */
  async function initialFunc() {
    const authors = await fetchAuthors();
    const {data: comments} = await fetchComments();
    let likesCount = 0;
    let commentsCount = 0;

    // считаем комменты и лайки. не придумал ничего лучше, без модификации папки с api, кроме как обратиться к "источнику"
    [commentsPage1, commentsPage2, commentsPage3].forEach(i => {
      i.data.forEach(comment => {
        commentsCount += 1;
        likesCount += comment.likes;
      })
    });

    setCommentsCount(commentsCount);
    setLikesCount(likesCount);
    setAuthors(authors || []);
    setComments(prepareComments(comments, authors));
  }

  /** Запрос авторов */
  async function fetchAuthors() {
    try {
      const response = await getAuthorsRequest();
      return response as Author[];
    } catch (e) {
      console.error(e);
    }
  }

  /** Постраничный запрос комментариев */
  async function fetchComments(page = 1): Promise<{data: Comment[]}> {
    setLoading(true);
    try {
      return await getCommentsRequest(page);
    } catch (e) {
      console.error(e);
      return await fetchComments(page)
    } finally {
      setLoading(false);
    }
  }

  /** Подготавливает комменты к отображению, образовывая вложенность и добавляя авторов */
  function prepareComments(rawComments: any[]|undefined, authors: Author[]|undefined): CommentType[] {
    if (!rawComments || !rawComments.length || !authors) {
      return [];
    }
    const comments: CommentType[] = [];
    const childs: CommentType[] = [];
    rawComments.forEach(comment => {
      const newComment: CommentType = {...comment, author: authors.find(i => i.id === comment.author)!};
      if (!comment.parent) {
        comments.push(newComment);
      } else {
        childs.push(newComment);
      }
    });
    childs.forEach(comment => {
      const parent = comments.find(c => c.id === comment.parent);
      if (parent) {
        if (parent.childs) {
          parent.childs.push(comment);
        } else {
          parent.childs = [comment];
        }
      }
    })
    return comments;
  }

  /** Увеличивает или уменьшает число лайков */
  function addToLikes(val: number) {
    setLikesCount((likesCount) => likesCount + val);
  }

  /** Обработка клика по кнопке */
  async function buttonClickHandler() {
    try {
      const {data: comments} = await fetchComments(currentPage + 1);
      setComments(prepareComments(comments, authors));
      setCurentPage(c => c + 1);
    } catch (e) {
      console.error(e)
    }
  }

  const memorizedAddToLikes = useCallback(addToLikes, []);


  return (
    <div className="container">
      <div className="summary">
        <p className="summary__comments-count">
          {commentsCount} комментариев
        </p>
        <p className="summary__likes-count">{likesCount.toLocaleString()}</p>
      </div>
      {loading
        ? <p className="loading-message">Загрузка...</p>
        : comments.length
          ? (
            <>
              <div className="comments-list">
                {comments.map(comment => (
                  <Comment
                    key={comment.id}
                    comment={comment}
                    onLike={memorizedAddToLikes}
                  />
                ))}
              </div>
              {currentPage < 3
                ? <button className="download-button" type='button' onClick={buttonClickHandler}>Загрузить еще</button>
                : null
              }
            </>
          )
          : <p className='no-data-message'>Нет данных для отображения</p>
        }
    </div>
  );
}


export default App;
