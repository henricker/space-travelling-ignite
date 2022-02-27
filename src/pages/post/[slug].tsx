import { GetStaticPaths, GetStaticProps } from 'next';

import Prismic from '@prismicio/client';
import { ReactElement } from 'react';
import { useRouter } from 'next/router';
import { format } from 'date-fns';
import ptBr from 'date-fns/locale/pt-BR';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import Image from 'next/image';
import { RichText } from 'prismic-dom';
import { getPrismicClient } from '../../services/prismic';
import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  uid: string | null;
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    subtitle: string;
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): ReactElement {
  const { isFallback } = useRouter();

  function estimatedReadTime(): number {
    const estimatedTime = post.data.content.reduce((total, content) => {
      // eslint-disable-next-line no-param-reassign
      total += content.heading.split(' ').length;

      const words = content.body.map(item => item.text.split(' ').length);
      words.forEach(value => {
        // eslint-disable-next-line no-param-reassign
        total += value;
      });
      return total;
    }, 0);

    return Math.ceil(estimatedTime / 200);
  }

  const readTime = estimatedReadTime();

  return isFallback ? (
    <div className={styles.loading}>Carregando...</div>
  ) : (
    <>
      <div className={styles.banner}>
        <Image
          unoptimized
          src={post.data.banner.url}
          alt="banner"
          width={1440}
          height={400}
          className={styles.img}
        />
      </div>

      <div className={styles.postContainer}>
        <p className={styles.postTitle}>{post.data.title}</p>
        <div className={styles.info}>
          <div className={styles.info_option}>
            <FiCalendar
              size={22}
              style={{
                marginRight: '10px',
              }}
            />
            <time>
              {format(new Date(post.first_publication_date), 'd MMM y', {
                locale: ptBr,
              })}
            </time>
          </div>
          <div className={styles.info_option}>
            <FiUser
              size={22}
              style={{
                marginRight: '10px',
              }}
            />
            <p>{post.data.author}</p>
          </div>
          <div className={styles.info_option}>
            <FiClock
              size={22}
              style={{
                marginRight: '10px',
              }}
            />
            <p>{readTime} min</p>
          </div>
        </div>

        <div className={styles.content}>
          {post.data.content.map((data, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <div className={styles.subcontent} key={index}>
              <p className={styles.handlingtitle}>{data.heading}</p>
              <div
                className={styles.text}
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{ __html: RichText.asHtml(data.body) }}
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    Prismic.predicates.at('document.type', 'posts')
  );

  const paths = posts.results.map(post => ({ params: { slug: post.uid } }));

  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const prismic = getPrismicClient();
  const { slug } = params;

  const response = await prismic.getByUID('posts', String(slug), {});

  const post: Post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      banner: {
        url: response.data.banner.url,
      },
      subtitle: response.data.subtitle,
      author: response.data.author,
      content: response.data.content.map(content => ({
        heading: content.heading,
        body: content.body,
      })),
    },
  };

  return {
    props: {
      post,
    },
  };
};
