package com.cyberas.domain.scanner;

import java.util.UUID;

/**
 * Demande d'exécution d'un scan.
 *
 * Émise pendant la transaction de création, mais consommée seulement après son
 * commit : un worker lancé plus tôt cherche un scan que sa propre transaction ne
 * voit pas encore, et abandonne sur un « introuvable ».
 */
public record ScanRequested(UUID scanId) {
}
