import React, {useCallback, useState} from 'react';
import {CommentType} from '../models/models'
import './Comment.css';

type Props = {
  comment: CommentType,
  onLike: Function,
}

function Comment({comment, onLike}: Props) {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(comment.likes);
  const memorizedAddToLikes = useCallback(onLike, []);

  function getDate(date: string): string {
    const currentDate: any = new Date();
    const newDate: any = new Date(date)
    const difference = Math.trunc((currentDate - newDate) / 3600000);

    /** Добавляет переданному числу предстоящий 0 если число меньше 9 */
    function toDoubleDigits(val: number): string {
      return val <= 9 ? `0${val}` : `${val}`;
    }

    switch (difference) {
      case 1:
        return '1 час назад';
      case 3:
        return '3 часа назад';
      default:
        const day = toDoubleDigits(newDate.getDate());
        const month = toDoubleDigits(newDate.getMonth());
        const hours = toDoubleDigits(newDate.getHours());
        const minutes = toDoubleDigits(newDate.getMinutes());
        const seconds = toDoubleDigits(newDate.getSeconds());
        return `${day}.${month}.${newDate.getFullYear()}, ${hours}:${minutes}:${seconds}`;
    }
  }

  return (
    <div className='comment'>
      <div className="comment__wrapper">
        <div className="comment__avatar" style={{backgroundImage: `url(${comment.author.avatar})`}}></div>
        <div className="comment__text">
          <p className="comment__author-name">{comment.author.name}</p>
          <p className="comment__date">{getDate(comment.created)}</p>
          <div
            className={`comment__likes ${liked ? 'comment__likes_liked' : ''}`}
            onClick={() => {
              onLike(liked ? -1 : 1);
              setLikesCount(liked ? likesCount - 1 : likesCount + 1)
              setLiked(!liked);
            }}
          >
            {likesCount.toLocaleString()}
          </div>
          <p className="comment__content">{comment.text}</p>
        </div>
      </div>
      {comment.childs
        ?
          <div className='comment__child-comments'>
            {comment.childs.map(c => (
              <Comment onLike={memorizedAddToLikes} key={c.id} comment={c} />
            ))}
          </div>
        : null
      }
    </div>
  )
}

export default React.memo(Comment);
