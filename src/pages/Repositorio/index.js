import React, {useState, useEffect} from 'react';
import {Container, Owner, Loading, BackButton, IssuesList, PageAction, FilterList} from './styles';
import {FaArrowLeft} from 'react-icons/fa';
import api from '../../services/api';

export default function Repositorio({match}){

  //Só um objeto
  const [repositorio, setRepositorio] = useState({});

  //Um array
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filtros, setFiltros] = useState([
    {state: 'all', label: 'Todas', active: true},
    {state: 'open', label: 'Abertas', active: false},
    {state: 'closed', label: 'Fechadas', active: false}
  ]);
  const [filtroIndex, setFiltrosIndex] = useState(0);

  useEffect(()=> {

    async function load(){
      const nomeRepo = decodeURIComponent(match.params.repositorio);
      //Duas requisições ao mesmo tempo
      const [repositorioData, issuesData] = await Promise.all([
        api.get(`/repos/${nomeRepo}`),
        api.get(`/repos/${nomeRepo}/issues`, {
          params: {
            state: filtros.find(f => f.active).state,
            per_page: 5
          }
        })
      ]);

      //console.log(repositorioData);
      //console.log(issuesData);

      setRepositorio(repositorioData.data);
      setIssues(issuesData.data);
      setLoading(false);

    }

    load();

  }, [match.params.repositorio]);

  useEffect(() => {
    async function loadIssues(){
      const nomeRepo = decodeURIComponent(match.params.repositorio);
      const response = await api.get(`/repos/${nomeRepo}/issues`, {
        params: {
          state: filtros[filtroIndex].state,
          page: page,
          per_page: 5
        },
      });
      setIssues(response.data);
    }

    loadIssues();

  }, [filtroIndex, filtros, match.params.repositorio, page])

  function handlePage(action){
    setPage(action === 'back' ? page - 1: page + 1)
  }

  function handleFilter(index){
    setFiltrosIndex(index);
  }

  if(loading){
    return(
      <Loading>
        <h1>Carregando...</h1>
      </Loading>
    );
  }


  return(
    <Container>
      <BackButton to="/">
        <FaArrowLeft color="#000" size={35}/>
      </BackButton>
      <Owner>
        <img src={repositorio.owner.avatar_url} alt={repositorio.owner.login}/>
        <h1>{repositorio.name}</h1>
        <p>{repositorio.description}</p>
      </Owner>

      <FilterList active={filtroIndex}>
      {filtros.map((filter, index) => (
          <button type="button" key={filter.label} onClick={()=> handleFilter(index)}>
            {filter.label}
          </button>
        ))}
      </FilterList>

      <IssuesList>
        {issues.map(issue => (
          <li key={String(issue.id)}>
            <img src={issue.user.avatar_url} alt={issue.user.login} />
            <div>
              <strong>
                <a href={issue.html_url} target="_blank">{issue.title}</a>
                {issue.labels.map(label => (
                  <span key={String(label.id)}>{label.name}</span>
                ))}
              </strong>
              <p>{issue.user.login}</p>
            </div>
          </li>
        ))}
      </IssuesList>

      <PageAction>
        <button type="button" onClick={()=>handlePage('back')} disabled={page < 2}>Voltar</button>
        <button type="button" onClick={()=>handlePage('next')}>Proxima</button>
      </PageAction>

    </Container>
  );
}
