import { ReactElement } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './header.module.scss';

export default function Header(): ReactElement {
  return (
    <header className={styles.header}>
      <div className={styles.contentHeader}>
        <Link href="/">
          <a>
            <Image
              src="/header/logo.svg"
              alt="logo"
              width={238.62}
              height={25.63}
              className={styles['logo-img']}
            />
          </a>
          {/* <img src="header/logo.svg" alt="logo" /> */}
        </Link>
      </div>
    </header>
  );
}
