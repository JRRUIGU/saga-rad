import { Manga } from '@/types/manga'

// Mock data for development
const mockMangaData: Manga[] = [
  {
    id: 1,
    title: 'Attack on Titan',
    description: 'Humanity lives inside cities surrounded by enormous walls due to the Titans, giant humanoid creatures who devour humans.',
    author: 'Hajime Isayama',
    artist: 'Hajime Isayama',
    status: 'completed',
    genres: ['Action', 'Drama', 'Fantasy', 'Horror'],
    chapters_count: 139,
    views_count: 4500000,
    rating: 4.8,
    cover_image: 'https://res.cloudinary.com/demo/image/upload/w_300,q_auto/manga/attack_on_titan',
    created_at: '2023-01-01',
    updated_at: '2023-12-01'
  },
  {
    id: 2,
    title: 'One Piece',
    description: 'Monkey D. Luffy sets off on an adventure with his pirate crew to find the legendary treasure known as One Piece.',
    author: 'Eiichiro Oda',
    artist: 'Eiichiro Oda',
    status: 'ongoing',
    genres: ['Action', 'Adventure', 'Comedy', 'Fantasy'],
    chapters_count: 1100,
    views_count: 9800000,
    rating: 4.9,
    cover_image: 'https://res.cloudinary.com/demo/image/upload/w_300,q_auto/manga/one_piece',
    created_at: '1997-01-01',
    updated_at: '2024-01-01'
  },
  {
    id: 3,
    title: 'Naruto',
    description: 'Naruto Uzumaki, a mischievous adolescent ninja, struggles as he searches for recognition and dreams of becoming the Hokage.',
    author: 'Masashi Kishimoto',
    artist: 'Masashi Kishimoto',
    status: 'completed',
    genres: ['Action', 'Adventure', 'Fantasy', 'Martial Arts'],
    chapters_count: 700,
    views_count: 3200000,
    rating: 4.7,
    cover_image: 'https://res.cloudinary.com/demo/image/upload/w_300,q_auto/manga/naruto',
    created_at: '1999-01-01',
    updated_at: '2014-01-01'
  },
  {
    id: 4,
    title: 'Demon Slayer',
    description: 'Tanjiro Kamado becomes a demon slayer after his family is slaughtered and his sister turned into a demon.',
    author: 'Koyoharu Gotouge',
    artist: 'Koyoharu Gotouge',
    status: 'completed',
    genres: ['Action', 'Fantasy', 'Supernatural'],
    chapters_count: 205,
    views_count: 2800000,
    rating: 4.8,
    cover_image: 'https://res.cloudinary.com/demo/image/upload/w_300,q_auto/manga/demon_slayer',
    created_at: '2016-01-01',
    updated_at: '2020-01-01'
  },
  {
    id: 5,
    title: 'Jujutsu Kaisen',
    description: 'Yuji Itadori joins a secret organization of Jujutsu Sorcerers to eliminate a powerful Curse named Ryomen Sukuna.',
    author: 'Gege Akutami',
    artist: 'Gege Akutami',
    status: 'ongoing',
    genres: ['Action', 'Fantasy', 'Supernatural', 'Horror'],
    chapters_count: 250,
    views_count: 3500000,
    rating: 4.8,
    cover_image: 'https://res.cloudinary.com/demo/image/upload/w_300,q_auto/manga/jujutsu_kaisen',
    created_at: '2018-01-01',
    updated_at: '2024-01-01'
  },
  {
    id: 6,
    title: 'Chainsaw Man',
    description: 'Denji becomes a devil hunter after merging with his pet devil Pochita, gaining the ability to transform parts of his body into chainsaws.',
    author: 'Tatsuki Fujimoto',
    artist: 'Tatsuki Fujimoto',
    status: 'ongoing',
    genres: ['Action', 'Horror', 'Comedy', 'Supernatural'],
    chapters_count: 150,
    views_count: 2800000,
    rating: 4.7,
    cover_image: 'https://res.cloudinary.com/demo/image/upload/w_300,q_auto/manga/chainsaw_man',
    created_at: '2018-01-01',
    updated_at: '2024-01-01'
  },
  {
    id: 7,
    title: 'My Hero Academia',
    description: 'In a world where most people have superpowers, Izuku Midoriya dreams of becoming a hero despite being born without powers.',
    author: 'Kohei Horikoshi',
    artist: 'Kohei Horikoshi',
    status: 'ongoing',
    genres: ['Action', 'Adventure', 'Superhero', 'Comedy'],
    chapters_count: 420,
    views_count: 3800000,
    rating: 4.6,
    cover_image: 'https://res.cloudinary.com/demo/image/upload/w_300,q_auto/manga/my_hero_academia',
    created_at: '2014-01-01',
    updated_at: '2024-01-01'
  },
  {
    id: 8,
    title: 'Tokyo Revengers',
    description: 'Takemichi Hanagaki travels back in time to his middle school years to save his girlfriend and change the future.',
    author: 'Ken Wakui',
    artist: 'Ken Wakui',
    status: 'completed',
    genres: ['Action', 'Drama', 'Time Travel', 'Delinquent'],
    chapters_count: 278,
    views_count: 2200000,
    rating: 4.5,
    cover_image: 'https://res.cloudinary.com/demo/image/upload/w_300,q_auto/manga/tokyo_revengers',
    created_at: '2017-01-01',
    updated_at: '2022-01-01'
  },
  {
    id: 9,
    title: 'Spy x Family',
    description: 'A spy on an undercover mission gets married and adopts a child as part of his cover, not realizing his family has secrets of their own.',
    author: 'Tatsuya Endo',
    artist: 'Tatsuya Endo',
    status: 'ongoing',
    genres: ['Action', 'Comedy', 'Slice of Life'],
    chapters_count: 100,
    views_count: 3200000,
    rating: 4.9,
    cover_image: 'https://res.cloudinary.com/demo/image/upload/w_300,q_auto/manga/spy_x_family',
    created_at: '2019-01-01',
    updated_at: '2024-01-01'
  },
  {
    id: 10,
    title: 'Bleach',
    description: 'Ichigo Kurosaki gains the powers of a Soul Reaper and dedicates his life to protecting the innocent from evil spirits.',
    author: 'Tite Kubo',
    artist: 'Tite Kubo',
    status: 'completed',
    genres: ['Action', 'Adventure', 'Fantasy', 'Supernatural'],
    chapters_count: 686,
    views_count: 2900000,
    rating: 4.6,
    cover_image: 'https://res.cloudinary.com/demo/image/upload/w_300,q_auto/manga/bleach',
    created_at: '2001-01-01',
    updated_at: '2016-01-01'
  },
  {
    id: 11,
    title: 'Hunter x Hunter',
    description: 'Gon Freecss aspires to become a Hunter like his father, embarking on a journey to take the Hunter Examination.',
    author: 'Yoshihiro Togashi',
    artist: 'Yoshihiro Togashi',
    status: 'hiatus',
    genres: ['Action', 'Adventure', 'Fantasy'],
    chapters_count: 400,
    views_count: 2600000,
    rating: 4.9,
    cover_image: 'https://res.cloudinary.com/demo/image/upload/w_300,q_auto/manga/hunter_x_hunter',
    created_at: '1998-01-01',
    updated_at: '2022-01-01'
  },
  {
    id: 12,
    title: 'Death Note',
    description: 'Light Yagami finds a supernatural notebook that allows him to kill anyone by writing their name while picturing their face.',
    author: 'Tsugumi Ohba',
    artist: 'Takeshi Obata',
    status: 'completed',
    genres: ['Mystery', 'Psychological', 'Supernatural', 'Thriller'],
    chapters_count: 108,
    views_count: 3100000,
    rating: 4.8,
    cover_image: 'https://res.cloudinary.com/demo/image/upload/w_300,q_auto/manga/death_note',
    created_at: '2003-01-01',
    updated_at: '2006-01-01'
  }
]

interface Filters {
  search: string
  genre: string
  status: string
  sortBy: string
}

export async function getMangaList(filters: Filters): Promise<Manga[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500))
  
  let filtered = [...mockMangaData]
  
  // Apply search filter
  if (filters.search) {
    const searchLower = filters.search.toLowerCase()
    filtered = filtered.filter(manga => 
      manga.title.toLowerCase().includes(searchLower) ||
      manga.author.toLowerCase().includes(searchLower) ||
      manga.genres.some(genre => genre.toLowerCase().includes(searchLower))
    )
  }
  
  // Apply genre filter
  if (filters.genre) {
    filtered = filtered.filter(manga => 
      manga.genres.includes(filters.genre)
    )
  }
  
  // Apply status filter
  if (filters.status) {
    filtered = filtered.filter(manga => 
      manga.status === filters.status
    )
  }
  
  // Apply sorting
  switch (filters.sortBy) {
    case 'latest':
      filtered.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      break
    case 'rating':
      filtered.sort((a, b) => b.rating - a.rating)
      break
    case 'az':
      filtered.sort((a, b) => a.title.localeCompare(b.title))
      break
    case 'popular':
    default:
      filtered.sort((a, b) => b.views_count - a.views_count)
      break
  }
  
  return filtered
}

export async function getMangaById(id: number): Promise<Manga | null> {
  await new Promise(resolve => setTimeout(resolve, 300))
  return mockMangaData.find(manga => manga.id === id) || null
}