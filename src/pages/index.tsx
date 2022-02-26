import { GetStaticProps } from 'next';
import { ReactElement } from 'react';

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import posts from '../mocks/posts.json';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home(): ReactElement {
  return (
    <div className={styles.container}>
      <ul className={styles.posts}>
        {posts.map(post => (
          <li>
            <p className={styles.title}>{post.data.title}</p>
            <p className={styles.preview}>{post.data.subtitle}</p>
            <div className={styles.info}>
              <div className={styles.info_option}>
                <img src="calendar.svg" alt="calendar" />
                <time>{post.first_publication_date}</time>
              </div>
              <div className={styles.info_option}>
                <img src="user.svg" alt="calendar" />
                <p>{post.data.author}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <a className={styles.loadPosts}>Carregar mais posts</a>
    </div>
  );
}

// export const getStaticProps = async () => {
//   // const prismic = getPrismicClient();
//   // const postsResponse = await prismic.query(TODO);

//   // TODO
// };
