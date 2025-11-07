import projetoAuthangular from '/assets/images/projeto_authangular.png';
import projetoEcommerce from '/assets/images/projeto_ecommerce.png';
import projetoNikeclone from '/assets/images/projeto_nikeclone.png';
import projetoPedepet from '/assets/images/projeto_pedepet.png';
import angularIcon from '/assets/icons/icons8-angular.svg';
import tsIcon from '/assets/icons/icons8-typescript.svg';
import nodeIcon from '/assets/icons/node-js-svgrepo-com.svg';
import swaggerIcon from '/assets/icons/swagger-svgrepo-com.svg';
import reactIcon from '/assets/icons/react-svgrepo-com.svg';
import jsIcon from '/assets/icons/icons8-js.svg';
import kotlin from '/assets/icons/icons8-kotlin.svg';
import spring from '/assets/icons/icons8-spring-logo.svg';
import mySql from '/assets/icons/mysql-svgrepo-com.svg';
import tailwindIcon from '/assets/icons/icons8-tailwind-css.svg';
import htmlIcon from '/assets/icons/icons8-html.svg';
import cssIcon from '/assets/icons/icons8-css.svg';

export const projetos = [

  {
    nome: 'ERP para varejo',
    imagem: projetoEcommerce,
    descricao: 'Projeto de sistema de gestão empresarial (ERP) voltado para o nicho de varejo, com controle de estoque, vendas, ecommerce e relatórios.',
    nome_en: 'Retail ERP',
    descricao_en: 'Enterprise Resource Planning (ERP) system for retail, with inventory, sales, e-commerce and reporting features.',
    nome_es: 'ERP para comercios',
    descricao_es: 'Sistema ERP para comercios minoristas, con control de inventario, ventas, ecommerce y reportes.',
    codigo: 'https://github.com/RuyBarbosa22/Astro-ecommerce',
    icons: [reactIcon, jsIcon, tailwindIcon, nodeIcon, mySql, kotlin, spring, swaggerIcon],
    status: 'Em desenvolvimento',
    statusKey: 'inprogress',
  },
  {
    nome: 'Nike Clone',
    imagem: projetoNikeclone,
    descricao: 'Landing page responsiva inspirada no site da Nike. Esse foi meu primeiro projeto utilizando React e Tailwind CSS, foi aqui que tudo começou!',
    nome_en: 'Nike Clone',
    descricao_en: 'Responsive landing page inspired by Nike. My first React + Tailwind project.',
    nome_es: 'Clon de Nike',
    descricao_es: 'Página de aterrizaje responsiva inspirada en Nike. Mi primer proyecto con React y Tailwind.',
    codigo: 'https://github.com/RuyBarbosa22/Nike-Clone',
    icons: [reactIcon, jsIcon, tailwindIcon, nodeIcon],
    status: 'Concluido',
    statusKey: 'done',
  },
  {
    nome: 'PedePet',
    imagem: projetoPedepet,
    descricao: 'Plataforma desenvolvida para projeto academico, o objetivo era facilitar a adoção de pets através de lista de espera de futuras ninhadas de filhotes.',
    nome_en: 'PedePet',
    descricao_en: 'Platform to facilitate pet adoption using waiting lists for future litters.',
    nome_es: 'PedePet',
    descricao_es: 'Plataforma para facilitar la adopcion de mascotas mediante listas de espera para futuras camadas.',
    codigo: 'https://github.com/Grupo-1-SPTech/PedePet---System',
    icons: [htmlIcon, cssIcon, jsIcon, kotlin, mySql, spring, swaggerIcon],
    status: 'Concluido',
    statusKey: 'done',
  },
    {
    nome: 'AuthAngular',
    imagem: projetoAuthangular,
    descricao: 'Sistema de autenticação completo usando Angular, JWT e integração com backend Node.js.',
    nome_en: 'AuthAngular',
    descricao_en: 'Complete authentication system using Angular, JWT and Node.js backend.',
    nome_es: 'AuthAngular',
    descricao_es: 'Sistema de autenticacion completo usando Angular, JWT e backend Node.js.',
    codigo: 'https://github.com/RuyBarbosa22/auth-angular',
    icons: [angularIcon, tsIcon, nodeIcon, swaggerIcon],
    status: 'Não iniciado',
    statusKey: 'notstarted',
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
