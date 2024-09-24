export class HltbEntry {
    constructor(
       id,
       name,
       game_type,
       review_score,
       release_world,
       json_content,
       gameplayMain,
       gameplayMainExtra,
       gameplayCompletionist,
       similarity,
       searchTerm
    ) {
      this.id = id
      this.name = name
      this.game_type = game_type
      this.review_score = review_score
      this.release_world = release_world
      this.json_content = json_content
      this.gameplayMain = gameplayMain
      this.gameplayMainExtra = gameplayMainExtra
      this.gameplayCompletionist = gameplayCompletionist
      this.similarity = similarity
      this.searchTerm = searchTerm

    }
  }