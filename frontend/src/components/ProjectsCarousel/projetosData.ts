import projetoAuthangular from '../../assets/images/projeto_authangular.png';
import projetoEcommerce from '../../assets/images/projeto_ecommerce.png';
import projetoNikeclone from '../../assets/images/projeto_nikeclone.png';
import projetoPedepet from '../../assets/images/projeto_pedepet.png';
import angularIcon from '../../assets/icons/icons8-angular.svg';
import tsIcon from '../../assets/icons/icons8-typescript.svg';
import nodeIcon from '../../assets/icons/node-js-svgrepo-com.svg';
import jwtIcon from '../../assets/icons/swagger-svgrepo-com.svg';
import reactIcon from '../../assets/icons/react-svgrepo-com.svg';

export const projetos = [

  {
    nome: 'E-commerce',
    imagem: projetoEcommerce,
    descricao: 'Loja virtual com carrinho, integração de pagamentos e painel administrativo.',
    link: 'https://github.com/RuyBarbosa22/ecommerce',
    codigo: 'https://github.com/RuyBarbosa22/ecommerce',
    icons: [tsIcon, nodeIcon],
  },
  {
    nome: 'Nike Clone',
    imagem: projetoNikeclone,
    descricao: 'Landing page responsiva inspirada no site da Nike, feita com React e Tailwind.',
    link: 'https://github.com/RuyBarbosa22/nike-clone',
    codigo: 'https://github.com/RuyBarbosa22/nike-clone',
    icons: [tsIcon, reactIcon],
  },
  {
    nome: 'PedePet',
    imagem: projetoPedepet,
    descricao: 'App para adoção de pets, busca por localização e cadastro de animais.',
    link: 'https://github.com/RuyBarbosa22/pedepet',
    codigo: 'https://github.com/RuyBarbosa22/pedepet',
    icons: [reactIcon, nodeIcon],
  },
    {
    nome: 'AuthAngular',
    imagem: projetoAuthangular,
    descricao: 'Sistema de autenticação completo usando Angular, JWT e integração com backend Node.js.',
    link: 'https://github.com/RuyBarbosa22/auth-angular',
    codigo: 'https://github.com/RuyBarbosa22/auth-angular',
    icons: [angularIcon, tsIcon, nodeIcon, jwtIcon],
  },
];

/*
  Where to edit projects:
  - Edit this file `src/components/ProjectsCarousel/projetosData.ts` to add/remove projects.
  - Each project object supports the fields:
      - nome: string
      - imagem: imported image (use imports at top)
      - descricao: string
      - link: URL to project page (optional)
      - codigo: URL to repository (used when clicking the card)
      - icons: array of imported icon paths to show tech badges
  - To add new icons or images, import them at the top of this file from `src/assets/...`.
*/
