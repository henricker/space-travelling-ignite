import { GetStaticProps } from 'next';
import { ReactElement, useState } from 'react';

import Prismic from '@prismicio/client';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import Link from 'next/link';
import { getPrismicClient } from '../services/prismic';
import styles from './home.module.scss';

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

export default function Home({ postsPagination }: HomeProps): ReactElement {
  const [nextPage, setNextPage] = useState<string | null>(
    postsPagination.next_page
  );
  const [posts, setPosts] = useState(postsPagination.results);

  async function handleFetchNewPosts(): Promise<void> {
    const response = await fetch(nextPage);

    const { next_page, results } = await response.json();

    const newPosts: Post[] = results.map(v => ({
      first_publication_date: v.first_publication_date,
      uid: v.uid,
      data: v.data,
    }));

    setPosts(oldState => [...oldState, ...newPosts]);
    setNextPage(() => next_page);
  }

  return (
    <div className={styles.container}>
      <ul className={styles.posts}>
        {posts.map(post => (
          <li key={post.uid}>
            <Link href={`/post/${post.uid}`}>
              <p className={styles.title}>{post.data.title}</p>
            </Link>
            <p className={styles.preview}>{post.data.subtitle}</p>
            <div className={styles.info}>
              <div className={styles.info_option}>
                <img src="calendar.svg" alt="calendar" />
                <time>
                  {format(new Date(post.first_publication_date), 'd MMM y', {
                    locale: ptBR,
                  })}
                </time>
              </div>
              <div className={styles.info_option}>
                <img src="user.svg" alt="calendar" />
                <p>{post.data.author}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
      {nextPage && (
        <button
          type="button"
          className={styles.loadPosts}
          onClick={handleFetchNewPosts}
        >
          Carregar mais posts
        </button>
      )}
    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: ['posts.title', 'posts.author', 'posts.subtitle'],
      pageSize: 1,
    }
  );

  const postsPagination: PostPagination = {
    next_page: postsResponse.next_page,
    results: postsResponse.results.map<Post>(v => ({
      first_publication_date: v.first_publication_date,
      uid: v.uid,
      data: v.data,
    })),
  };

  return {
    props: {
      postsPagination,
    },
  };
};
