import { GetStaticPaths, GetStaticProps } from 'next';

import Prismic from '@prismicio/client';
import { ReactElement } from 'react';
import { useRouter } from 'next/router';
import { format } from 'date-fns';
import ptBr from 'date-fns/locale/pt-BR';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import Image from 'next/image';
import { RichText } from 'prismic-dom';
import Link from 'next/link';
import { getPrismicClient } from '../../services/prismic';
import styles from './post.module.scss';

interface Post {
  uid: string | null;
  first_publication_date: string | null;
  last_publication_date: string | null;
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
  navigation: {
    previousPost: {
      uid: string;
      data: {
        title: string;
      };
    }[];
    nextPost: {
      uid: string;
      data: {
        title: string;
      };
    }[];
  };
}

export default function Post({ post, navigation }: PostProps): ReactElement {
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
  const totalNavigations =
    navigation.nextPost[0] && navigation.previousPost[0] ? 2 : 1;

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
        <p className={styles.updatedInfo}>
          * editado em{' '}
          {format(new Date(post.last_publication_date), 'd MMM y', {
            locale: ptBr,
          })}{' '}
          às {format(new Date(post.last_publication_date), 'HH:mm')}
        </p>

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
        <div className={styles.dividingLine} />
        <div
          className={styles.navigationPosts}
          style={
            // eslint-disable-next-line no-nested-ternary
            totalNavigations === 2
              ? { justifyContent: 'space-between' }
              : navigation?.nextPost[0]
              ? { justifyContent: 'flex-end' }
              : { justifyContent: 'flex-start' }
          }
        >
          {navigation?.previousPost.length > 0 && (
            <div className={styles.navigationContainerPrevious}>
              <Link href={`/post/${navigation?.previousPost[0].uid}`}>
                <a>
                  <button type="button" style={{ textAlign: 'left' }}>
                    <p style={{ marginLeft: '0.5rem' }}>Como utilizar hooks</p>
                    <p style={{ marginLeft: '0.5rem' }}>Post anterior</p>
                  </button>
                </a>
              </Link>
            </div>
          )}
          {navigation?.nextPost.length > 0 && (
            <div className={styles.navigationContainerNext}>
              <Link href={`/post/${navigation?.nextPost[0].uid}`}>
                <a>
                  <button type="button" style={{ textAlign: 'right' }}>
                    <p style={{ marginRight: '0.5rem' }}>
                      {' '}
                      Criando um APP CRA do zero
                    </p>
                    <p style={{ marginRight: '0.5rem' }}>Próximo post</p>
                  </button>
                </a>
              </Link>
            </div>
          )}
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

  const nextPost = await prismic.query(
    [Prismic.Predicates.at('document.type', 'posts')],
    {
      pageSize: 1,
      after: response.id,
      orderings: '[document.first_publication_date ]',
    }
  );
  const previousPost = await prismic.query(
    [Prismic.Predicates.at('document.type', 'posts')],
    {
      pageSize: 1,
      after: response.id,
      orderings: '[document.last_publication_date desc]',
    }
  );

  const post: Post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    last_publication_date: response.last_publication_date,
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
      navigation: {
        previousPost: previousPost?.results,
        nextPost: nextPost?.results,
      },
    },
  };
};
