import { GetStaticProps } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Head from 'next/head';
import { format, parseISO } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { api } from '../services/api';
import { convertDurationToTimeString } from '../utils/convertDurationToTimeString';

import styles from './home.module.scss';
import { usePlayer } from '../contexts/PlayerContext';

interface IEpisode{
  id: string;
  title: string;
  thumbnail: string;
  members: string;
  publishedAt: string;
  duration: number,
  durationAsString: string,
  url: string,
}

interface IHomeProps{
  allEpisodes: Array<IEpisode>
  lastestEpisodes: Array<IEpisode>
}

export default function Home({ allEpisodes, lastestEpisodes }: IHomeProps) {
  const { playList } = usePlayer();

  const episodeList = [...lastestEpisodes, ...allEpisodes];

  return (
    <div className={styles.homepage}>
      <Head>
        <title>Home | Podcastr</title>
      </Head>
      <section className={styles.lastestEpisodes}>
        <h2>Últimos lançamentos</h2>
        <ul>
          {lastestEpisodes.map((e, index) => {
            return(
              <li key={e.id}>
                <Image 
                  width={192} 
                  height={192} 
                  src={e.thumbnail} 
                  alt={e.title} 
                  objectFit="cover"
                />

                <div className={styles.episodesDetails}>
                  <Link href={`/episodes/${e.id}`}>
                    <a>{e.title}</a>
                  </Link>
                  <p>{e.members}</p>
                  <span>{e.publishedAt}</span>
                  <span>{e.durationAsString}</span>
                </div>
                <button type="button" onClick={() => playList(episodeList, index)}>
                  <img src="/play-green.svg" alt="tocar episódio" />
                </button>
              </li>
            )
          })}
        </ul>
      </section>
      <section className={styles.allEpisodes}>
        <h2>Todos episódios</h2>
        <table cellSpacing={0}>
          <thead>
            <tr>
              <th></th>
              <th>Podcast</th>
              <th>Integrantes</th>
              <th>Data</th>
              <th>Duração</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {allEpisodes.map((e, index) => {
              return (
                <tr key={e.id}>
                  <td style={{ width: 72 }}>
                    <Image 
                      width={120}
                      height={120}
                      src={e.thumbnail}
                      alt={e.title}
                      objectFit="cover"
                    />
                  </td>
                  <td>
                    <Link href={`/episodes/${e.id}`}>
                      <a>{e.title}</a>
                    </Link>
                  </td>
                  <td>{e.members}</td>
                  <td style={{ width: 100 }}>{e.publishedAt}</td>
                  <td>{e.durationAsString}</td>
                  <td>
                    <button type="button" onClick={() => playList(episodeList, index + lastestEpisodes.length)}>
                      <img src="/play-green.svg" alt="tocar episódio" />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </section>
    </div>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const { data }= await api.get('episodes', {
    params: {
      _limit: 12,
      _sort: 'published_at',
      _order: 'desc'
    }
  });

  const episodes = data.map( e => {
    return {
      id: e.id,
      title: e.title,
      thumbnail: e.thumbnail,
      members: e.members,
      publishedAt: format(parseISO(e.published_at), 'd MMM yy', { locale: ptBR }),
      duration: Number(e.file.duration),
      durationAsString: convertDurationToTimeString(Number(e.file.duration)),
      url: e.file.url,
    }
  })

  const lastestEpisodes = episodes.slice(0, 2);
  const allEpisodes = episodes.slice(2, episodes.length);

  return {
    props: {
      allEpisodes,
      lastestEpisodes
    },
    revalidate: 60 * 60 * 8,
  }
}
